// Cloudflare Pages Function — proxies legal agent call to n8n server-side
// Avoids CORS and mixed-content issues from the browser

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { app_id, idea_id, source, app_name, package_name, descripcion_app, descripcion } = body;

  if (!source || !descripcion) {
    return new Response(JSON.stringify({ error: 'Missing required fields: source, descripcion' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const n8nBaseUrl = env.N8N_URL || 'http://localhost:5678';
  const n8nWebhookPath = env.N8N_WEBHOOK_PATH || 'webhook';

  const payload = { app_id, idea_id, app_name, package_name, descripcion_app, descripcion, source };

  try {
    const n8nResponse = await fetch(`${n8nBaseUrl}/${n8nWebhookPath}/agente-legal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await n8nResponse.text();

    if (!n8nResponse.ok) {
      return new Response(
        JSON.stringify({ error: `n8n error: ${n8nResponse.statusText}`, details: responseText }),
        { status: n8nResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let result;
    try { result = JSON.parse(responseText); } catch { result = { raw: responseText }; }

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
