import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useRealtimeRun(runId) {
  const [run, setRun] = useState(null);

  useEffect(() => {
    if (!runId) return;

    const channel = supabase
      .channel(`pipeline-run-${runId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_runs',
          filter: `id=eq.${runId}`,
        },
        (payload) => {
          setRun(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId]);

  return run;
}

export function usePipelineRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('pipeline_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setRuns(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createRun = async (data) => {
    try {
      const response = await fetch(`${SERVER_URL}/pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      await fetchRuns();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const cancelRun = async (runId) => {
    try {
      const response = await fetch(`${SERVER_URL}/pipeline/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      await fetchRuns();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { runs, loading, error, fetchRuns, createRun, cancelRun };
}
