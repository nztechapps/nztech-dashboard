import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useGastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false });

      if (err) throw err;
      setGastos(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createGasto = async (data) => {
    try {
      const { error: err } = await supabase
        .from('gastos')
        .insert([data]);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteGasto = async (id) => {
    try {
      const { error: err } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { gastos, loading, error, refetch, createGasto, deleteGasto };
}
