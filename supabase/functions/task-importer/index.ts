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

    // Validar que sea un array
    if (!Array.isArray(body)) {
      return new Response(
        JSON.stringify({ error: 'Expected an array of tasks' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Validar y preparar tareas
    const tasks = body.map((task) => ({
      app_id: task.app_id,
      titulo: task.titulo,
      tipo: task.tipo || 'pipeline',
      prioridad: task.prioridad || 3,
      estado: task.estado || 'todo',
      notas: task.notas || null,
    }))

    // Validar campos requeridos
    const validTasks = tasks.filter(t => t.app_id && t.titulo)
    if (validTasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid tasks with app_id and titulo' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    // Insertar tareas
    const { error } = await supabase
      .from('tasks')
      .insert(validTasks)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, inserted: validTasks.length }),
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
