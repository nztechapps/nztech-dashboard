import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useMetrics(appId, fechaDesde = null, fechaHasta = null) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appId) {
      fetchMetrics();
    }
  }, [appId, fechaDesde, fechaHasta]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('metrics')
        .select('*')
        .eq('app_id', appId)
        .order('fecha', { ascending: true });

      if (fechaDesde) {
        query = query.gte('fecha', fechaDesde);
      }
      if (fechaHasta) {
        query = query.lte('fecha', fechaHasta);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      setMetrics(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMetric = async (metricData) => {
    try {
      const { data, error: err } = await supabase
        .from('metrics')
        .insert([{ ...metricData, app_id: appId }])
        .select();

      if (err) throw err;
      await fetchMetrics();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const refetch = () => fetchMetrics();

  return { metrics, loading, error, refetch, createMetric };
}
