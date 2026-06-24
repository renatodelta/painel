export async function onRequest(context) {
  const cacheUrl = new URL(context.request.url);
  const cacheKey = new Request(cacheUrl.toString(), context.request);
  const cache = caches.default;
  
  // 1. Tentar ler do Cache da Cloudflare (30 min)
  try {
    let cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
  } catch (cacheErr) {
    console.error("Cache match error:", cacheErr);
  }

  const albumUrl = context.env.GOOGLE_PHOTOS_ALBUM_URL || 'https://photos.app.goo.gl/eFTriGzhsxFdu7mL8';
  let foundMedia = [];
  
  // PLANO A: Tenta scraping do álbum público
  try {
    const res = await fetch(albumUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const matches = html.matchAll(/https:\/\/lh3\.googleusercontent\.com\/pw\/[a-zA-Z0-9-_]+/gi);
      const uniqueBases = new Set();
      for (const match of matches) {
        const base = match[0].split('=')[0];
        if (base.length > 50) {
          uniqueBases.add(base);
        }
      }
      for (const baseUrl of uniqueBases) {
        foundMedia.push({
          url: baseUrl,
          caption: 'Lembrança do Álbum'
        });
      }
    }
  } catch (e) {
    console.error("Scraping error:", e);
  }

  // PLANO B: Se scraping falhar, usa a API oficial via Refresh Token das variáveis de ambiente
  if (foundMedia.length === 0) {
    const clientId = context.env.GOOGLE_CLIENT_ID;
    const clientSecret = context.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = context.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({
        error: 'GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET ausentes nas variáveis de ambiente da Cloudflare.'
      }), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      });
    }

    if (!refreshToken) {
      return new Response(JSON.stringify({
        error: 'Não autenticado no ambiente online. Acesse o google_auth.php online para obter o token e configure as Variáveis de Ambiente na Cloudflare.'
      }), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      });
    }

    try {
      // 1. Atualizar o Access Token
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token"
        })
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        return new Response(JSON.stringify({
          error: 'Falha ao renovar token. Verifique as credenciais e o GOOGLE_REFRESH_TOKEN na Cloudflare.'
        }), {
          headers: { 
            "content-type": "application/json;charset=UTF-8",
            "access-control-allow-origin": "*"
          }
        });
      }

      // 2. Buscar fotos de anos anteriores
      const now = new Date();
      const day = now.getDate();
      const month = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      for (let yearOffset = 1; yearOffset <= 12; yearOffset++) {
        const searchYear = currentYear - yearOffset;
        const searchParams = {
          filters: {
            dateFilter: {
              dates: [{ year: searchYear, month: month, day: day }]
            }
          }
        };

        const searchRes = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(searchParams)
        });
        const searchData = await searchRes.json();

        if (searchData.mediaItems) {
          for (const item of searchData.mediaItems) {
            foundMedia.push({
              url: item.baseUrl,
              caption: `Há ${yearOffset} anos neste dia...`
            });
          }
        }
        if (foundMedia.length > 5) break;
      }

      // PLANO C: Álbuns normais
      if (foundMedia.length === 0) {
        const albumRes = await fetch("https://photoslibrary.googleapis.com/v1/albums?pageSize=5", {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const albumData = await albumRes.json();

        if (albumData.albums) {
          for (const album of albumData.albums) {
            const itemRes = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ albumId: album.id, pageSize: 10 })
            });
            const itemData = await itemRes.json();
            if (itemData.mediaItems) {
              for (const item of itemData.mediaItems) {
                foundMedia.push({
                  url: item.baseUrl,
                  caption: `Lembrança do álbum: ${album.title}`
                });
              }
            }
            if (foundMedia.length > 20) break;
          }
        }
      }

      // PLANO D: Álbuns compartilhados
      if (foundMedia.length === 0) {
        const sharedRes = await fetch("https://photoslibrary.googleapis.com/v1/sharedAlbums?pageSize=5", {
          headers: { "Authorization": `Bearer ${accessToken}` }
        });
        const sharedData = await sharedRes.json();

        if (sharedData.sharedAlbums) {
          for (const album of sharedData.sharedAlbums) {
            const itemRes = await fetch("https://photoslibrary.googleapis.com/v1/mediaItems:search", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ albumId: album.id, pageSize: 10 })
            });
            const itemData = await itemRes.json();
            if (itemData.mediaItems) {
              for (const item of itemData.mediaItems) {
                foundMedia.push({
                  url: item.baseUrl,
                  caption: `Lembrança do álbum: ${album.title}`
                });
              }
            }
            if (foundMedia.length > 20) break;
          }
        }
      }

    } catch (apiErr) {
      console.error("API Google Error:", apiErr);
    }
  }

  // Fallback padrão se tudo falhar
  let result = foundMedia;
  if (result.length === 0) {
    result = [{
      url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200',
      caption: 'Conectado! Adicione fotos à biblioteca do Google Fotos para exibi-las aqui.'
    }];
  }

  const response = new Response(JSON.stringify(result), {
    headers: { 
      "content-type": "application/json;charset=UTF-8",
      "access-control-allow-origin": "*",
      "Cache-Control": "public, max-age=1800"
    }
  });

  // Salvar no Cache da Cloudflare em background
  try {
    context.waitUntil(cache.put(cacheKey, response.clone()));
  } catch (cacheErr) {
    console.error("Cache put error:", cacheErr);
  }

  return response;
}
