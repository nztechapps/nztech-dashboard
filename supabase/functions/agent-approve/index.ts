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

    const body = await req.json()
    const { id } = body

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing id' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Buscar el item
    const { data: item, error: selectError } = await supabase
      .from('agent_inbox')
      .select('*')
      .eq('id', id)
      .single()

    if (selectError || !item) throw selectError || new Error('Item not found')

    // Actualizar estado
    const { error: updateError } = await supabase
      .from('agent_inbox')
      .update({ estado: 'aprobado' })
      .eq('id', id)

    if (updateError) throw updateError

    // Si tiene webhook_url, hacer POST al webhook
    if (item.webhook_url) {
      try {
        await fetch(item.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.metadata || {}),
        })
      } catch (webhookErr) {
        console.error('Webhook error (non-blocking):', webhookErr)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
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
