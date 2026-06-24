export async function onRequest(context) {
  const db = context.env.DB || context.env.D1;
  if (!db) {
    return new Response(JSON.stringify({ 
      error: "O binding do banco de dados D1 com o nome 'DB' ou 'D1' não foi configurado no painel da Cloudflare." 
    }), {
      status: 500,
      headers: { "content-type": "application/json;charset=UTF-8" }
    });
  }

  const method = context.request.method;

  // GET: Retornar todas as configurações do D1
  if (method === "GET") {
    try {
      const { results } = await db.prepare("SELECT key, value FROM settings").all();
      const settings = {};
      
      results.forEach(row => {
        try {
          settings[row.key] = JSON.parse(row.value);
        } catch (e) {
          settings[row.key] = row.value; // se não for JSON válido, deixa string pura
        }
      });

      return new Response(JSON.stringify(settings), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "content-type": "application/json;charset=UTF-8" }
      });
    }
  }

  // POST: Salvar configurações recebidas no D1
  if (method === "POST" || method === "PUT") {
    try {
      const data = await context.request.json();
      const statements = [];

      for (const [key, value] of Object.entries(data)) {
        statements.push(
          db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)")
            .bind(key, JSON.stringify(value))
        );
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "content-type": "application/json;charset=UTF-8" }
      });
    }
  }

  // Outros métodos não suportados
  return new Response("Método não suportado", { status: 405 });
}
