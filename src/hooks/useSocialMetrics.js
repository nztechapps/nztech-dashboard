import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSocialMetrics() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_metrics')
        .select('*')
        .order('fecha', { ascending: true });
      if (error) throw error;
      setMetrics(data || []);
    } finally {
      setLoading(false);
    }
  };

  const createMetric = async (metricData) => {
    const { data, error } = await supabase
      .from('social_metrics')
      .upsert([metricData], { onConflict: 'plataforma,fecha' })
      .select();
    if (error) throw error;
    await fetchMetrics();
    return data[0];
  };

  const getByPlataforma = (plataforma) =>
    metrics.filter((m) => m.plataforma === plataforma);

  return { metrics, loading, createMetric, getByPlataforma };
}
