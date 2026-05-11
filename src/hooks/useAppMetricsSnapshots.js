import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAppMetricsSnapshots(ideaId) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ideaId) return;
    setLoading(true);
    supabase
      .from('app_metrics_snapshots')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setSnapshots(data || []);
        setLoading(false);
      });
  }, [ideaId]);

  const createSnapshot = async (data) => {
    const { data: row, error } = await supabase
      .from('app_metrics_snapshots')
      .insert([{ idea_id: ideaId, ...data }])
      .select()
      .single();
    if (error) throw error;
    setSnapshots((prev) => [row, ...prev].slice(0, 5));
    return row;
  };

  return { snapshots, loading, createSnapshot };
}
