import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAgentInbox() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('agent_inbox')
        .select('*, apps(nombre)')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const aprobar = async (id, webhookUrl = null) => {
    try {
      const { error: err } = await supabase
        .from('agent_inbox')
        .update({ estado: 'aprobado' })
        .eq('id', id);

      if (err) throw err;

      if (webhookUrl) {
        try {
          const item = items.find(i => i.id === id);
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.metadata || {}),
          });
        } catch (webhookErr) {
          console.error('Error posting to webhook:', webhookErr);
        }
      }

      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const rechazar = async (id) => {
    try {
      const { error: err } = await supabase
        .from('agent_inbox')
        .update({ estado: 'rechazado' })
        .eq('id', id);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const pendingCount = items.filter(i => i.estado === 'pendiente').length;

  return { items, pendingCount, loading, error, aprobar, rechazar, refetch };
}
