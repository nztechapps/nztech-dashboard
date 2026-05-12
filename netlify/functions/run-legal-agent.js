const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const N8N_BASE_URL = process.env.VITE_N8N_URL || 'http://localhost:5678';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { app_id, source, descripcion } = body;

  if (!app_id || !source || !descripcion) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: app_id, source, descripcion' }) };
  }

  // Fetch full record from the correct table
  let itemData;
  if (source === 'app') {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', app_id)
      .single();

    if (error || !data) {
      console.error('App not found:', error);
      return { statusCode: 404, body: JSON.stringify({ error: 'App not found' }) };
    }

    itemData = {
      app_id: data.id,
      app_name: data.nombre || data.name || '',
      package_name: data.package_name || '',
      descripcion_app: data.descripcion || data.description || '',
      mercado: data.mercado || '',
      categoria: data.categoria || '',
      source: 'app',
    };
  } else if (source === 'idea') {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', app_id)
      .single();

    if (error || !data) {
      console.error('Idea not found:', error);
      return { statusCode: 404, body: JSON.stringify({ error: 'Idea not found' }) };
    }

    itemData = {
      app_id: data.id,
      app_name: data.titulo || '',
      // Ideas may not have a package_name yet; use a slug-like placeholder
      package_name: data.package_name || '',
      descripcion_app: data.descripcion || '',
      mercado: data.mercado || '',
      categoria: data.categoria || '',
      source: 'idea',
    };
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: `Unknown source: ${source}` }) };
  }

  const payload = {
    ...itemData,
    descripcion,
  };

  try {
    const response = await fetch(`${N8N_BASE_URL}/webhook/agente-legal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('n8n error:', response.status, responseText);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `n8n webhook failed: ${response.statusText}`, details: responseText }),
      };
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, data: result }),
    };
  } catch (err) {
    console.error('Error calling n8n:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
