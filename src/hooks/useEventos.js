import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('eventos')
        .select('*, apps(nombre)')
        .order('fecha', { ascending: true });

      if (err) throw err;
      setEventos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (data) => {
    try {
      const { error: err } = await supabase
        .from('eventos')
        .insert([data]);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvento = async (id) => {
    try {
      const { error: err } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { eventos, loading, error, createEvento, deleteEvento, refetch };
}
