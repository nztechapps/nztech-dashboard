import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useResearch() {
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
        .from('research')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeido = async (id) => {
    try {
      const { error: err } = await supabase
        .from('research')
        .update({ leido: true })
        .eq('id', id);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const unreadCount = items.filter(i => !i.leido).length;

  return { items, unreadCount, loading, error, marcarLeido, refetch };
}
