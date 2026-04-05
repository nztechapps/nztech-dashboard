import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Validar Authorization header (esperado desde n8n)
    const authHeader = req.headers.get('authorization')
    const expectedToken = Deno.env.get('N8N_WEBHOOK_TOKEN')
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const body = await req.json()
    const { agente, tipo, titulo, contenido, metadata, webhook_url, app_id } = body

    // Validar campos requeridos
    if (!agente || !tipo || !titulo || !contenido) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Insertar en agent_inbox
    const { data, error } = await supabase
      .from('agent_inbox')
      .insert([
        {
          agente,
          tipo,
          titulo,
          contenido,
          metadata: metadata || {},
          webhook_url: webhook_url || null,
          app_id: app_id || null,
          estado: 'pendiente',
        },
      ])
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
}
