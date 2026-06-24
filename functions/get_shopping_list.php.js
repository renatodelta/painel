export async function onRequest(context) {
  const url = "https://docs.google.com/spreadsheets/d/14hIZHehMWzo9uUuvJq2JkhLx_Zha525dheCpN9QXs34/export?format=csv";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify([]), {
        headers: { 
          "content-type": "application/json;charset=UTF-8",
          "access-control-allow-origin": "*"
        }
      });
    }

    const csv = await res.text();
    const items = csv.split("\n")
      .map(line => line.trim().replace(/^["']|["']$/g, '').trim())
      .filter(item => item.length > 0);

    return new Response(JSON.stringify(items), {
      headers: { 
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 
        "content-type": "application/json;charset=UTF-8",
        "access-control-allow-origin": "*"
      }
    });
  }
}
