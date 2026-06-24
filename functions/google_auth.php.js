export async function onRequest(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  // Usar variáveis de ambiente da Cloudflare
  const clientId = context.env.GOOGLE_CLIENT_ID;
  const clientSecret = context.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return new Response("Erro: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET devem ser configurados nas variáveis de ambiente da Cloudflare.", { status: 400 });
  }
  
  const redirectUri = url.origin + url.pathname;

  if (!code) {
    // Redireciona para o Google
    const authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
      access_type: "offline",
      prompt: "consent"
    });
    return Response.redirect(`${authUrl}?${params.toString()}`, 302);
  }

  // Se recebeu o código, troca pelo Token
  try {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const postParams = new URLSearchParams({
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: postParams.toString()
    });

    const data = await tokenRes.json();

    if (data.refresh_token) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Autenticação do Painel</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #121212; color: #e0e0e0; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; }
            .card { background: #1e1e1e; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); max-width: 600px; width: 100%; border: 1px solid #333; }
            h1 { color: #32d74b; margin-top: 0; }
            code { background: #2d2d2d; padding: 12px; border-radius: 6px; display: block; white-space: pre-wrap; word-break: break-all; margin: 15px 0; color: #ff9f0a; font-family: monospace; border: 1px solid #444; user-select: all; }
            p { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Sucesso!</h1>
            <p>O Painel obteve as credenciais de acesso com sucesso.</p>
            <p>Copie o código abaixo e adicione-o como uma <strong>Variável de Ambiente</strong> nas configurações do seu projeto do Cloudflare Pages com o nome <strong><code>GOOGLE_REFRESH_TOKEN</code></strong>:</p>
            <code>${data.refresh_token}</code>
            <p>Além disso, configure as variáveis <strong><code>GOOGLE_CLIENT_ID</code></strong> e <strong><code>GOOGLE_CLIENT_SECRET</code></strong> com os mesmos valores que você usou no Google Cloud Console.</p>
            <p>Depois de adicionar as variáveis no painel da Cloudflare, o seu painel online conseguirá carregar todas as fotos do Google Fotos de forma oficial e segura!</p>
          </div>
        </body>
        </html>
      `;
      return new Response(html, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    } else {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Erro de Autenticação</title></head>
        <body style="background:#121212;color:#ff453a;font-family:sans-serif;padding:30px;">
          <h1>Erro na Autenticação</h1>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
        </html>
      `;
      return new Response(errorHtml, {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }
  } catch (err) {
    return new Response(`Erro: ${err.message}`, { status: 500 });
  }
}
