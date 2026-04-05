import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAsoTracker(appId) {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appId) {
      fetchKeywords();
    }
  }, [appId]);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('aso_tracker')
        .select('*')
        .eq('app_id', appId)
        .order('fecha', { ascending: false });

      if (err) throw err;
      setKeywords(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = async (data) => {
    try {
      const { error: err } = await supabase
        .from('aso_tracker')
        .insert([{
          app_id: appId,
          keyword: data.keyword,
          posicion: parseInt(data.posicion),
          fecha: data.fecha,
          notas: data.notas || null,
        }]);

      if (err) throw err;
      await fetchKeywords();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteKeyword = async (id) => {
    try {
      const { error: err } = await supabase
        .from('aso_tracker')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await fetchKeywords();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { keywords, loading, error, addKeyword, deleteKeyword };
}
