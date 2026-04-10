const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Netlify Function: run-agent-step
 *
 * Ejecuta un paso del procesamiento agéntico de ideas.
 *
 * Body esperado:
 * {
 *   ideaId: string,
 *   step: 1 | 2
 * }
 *
 * Respuesta:
 * {
 *   success: boolean,
 *   data: object (resultado del webhook),
 *   error?: string
 * }
 */

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { ideaId, step } = JSON.parse(event.body);

    if (!ideaId || !step || (step !== 1 && step !== 2)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid ideaId or step' }),
      };
    }

    // Fetch idea from Supabase
    const { data: idea, error: fetchError } = await supabase
      .from('ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (fetchError || !idea) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Idea not found' }),
      };
    }

    // Mark as processing
    await supabase
      .from('ideas')
      .update({ agente_status: 'processing' })
      .eq('id', ideaId);

    if (step === 1) {
      return await runStep1Research(ideaId, idea);
    } else if (step === 2) {
      return await runStep2Specs(ideaId, idea);
    }
  } catch (err) {
    console.error('Error in run-agent-step:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

/**
 * PASO 1 — Research de mercado
 *
 * Workflow n8n esperado: idea-research
 * - Trigger: Webhook POST /webhook/idea-research
 * - Input: { idea: { titulo, descripcion, mercado, categoria } }
 * - Nodo Claude (claude-sonnet-4-20250514):
 *   Prompt: "Analiza este mercado y app. Genera un análisis de mercado con 3-4 párrafos,
 *            tono analítico, identificando oportunidades, competencia y audiencia.
 *            Retorna solo el texto del análisis."
 * - Output: { research_mercado: "..." }
 * - Respuesta webhook: JSON con { research_mercado: "contenido generado" }
 */
async function runStep1Research(ideaId, idea) {
  try {
    const webhookUrl = 'http://localhost:5678/webhook/idea-research';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: {
          titulo: idea.titulo,
          descripcion: idea.descripcion,
          mercado: idea.mercado,
          categoria: idea.categoria,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Save result to Supabase
    const { error: updateError } = await supabase
      .from('ideas')
      .update({
        research_mercado: result.research_mercado,
        paso_agente: 1,
        agente_status: 'waiting_approval',
      })
      .eq('id', ideaId);

    if (updateError) {
      throw updateError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (err) {
    // Reset status on error
    await supabase
      .from('ideas')
      .update({ agente_status: 'idle' })
      .eq('id', ideaId);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
}

/**
 * PASO 2 — Specs técnicas
 *
 * Workflow n8n esperado: idea-specs
 * - Trigger: Webhook POST /webhook/idea-specs
 * - Input: { idea: { titulo, descripcion, mercado, research_mercado } }
 * - Nodo Claude (claude-sonnet-4-20250514):
 *   Prompt: "Basándote en esta idea y su research de mercado, genera especificaciones técnicas
 *            detalladas. Retorna un JSON con:
 *            {
 *              pantallas: 'lista de pantallas principales (separadas por comas)',
 *              flujos: 'flujo de usuario principal (3-4 pasos)',
 *              apis: 'APIs o integraciones necesarias (separadas por comas)',
 *              complejidad: 'baja | media | alta'
 *            }"
 * - Output: { pantallas: "...", flujos: "...", apis: "...", complejidad: "..." }
 * - Respuesta webhook: JSON con las specs
 */
async function runStep2Specs(ideaId, idea) {
  try {
    const webhookUrl = 'http://localhost:5678/webhook/idea-specs';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: {
          titulo: idea.titulo,
          descripcion: idea.descripcion,
          mercado: idea.mercado,
          research_mercado: idea.research_mercado,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Save result to Supabase
    const { error: updateError } = await supabase
      .from('ideas')
      .update({
        specs_pantallas: result.pantallas,
        specs_flujos: result.flujos,
        specs_apis: result.apis,
        complejidad: result.complejidad,
        paso_agente: 2,
        agente_status: 'waiting_approval',
      })
      .eq('id', ideaId);

    if (updateError) {
      throw updateError;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: result,
      }),
    };
  } catch (err) {
    // Reset status on error
    await supabase
      .from('ideas')
      .update({ agente_status: 'idle' })
      .eq('id', ideaId);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: err.message,
      }),
    };
  }
}
