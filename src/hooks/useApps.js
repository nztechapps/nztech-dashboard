import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('apps')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setApps(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchApps();

  const createApp = async (appData) => {
    try {
      const { data, error: err } = await supabase
        .from('apps')
        .insert([appData])
        .select();

      if (err) throw err;
      await refetch();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateApp = async (id, appData) => {
    try {
      const { data, error: err } = await supabase
        .from('apps')
        .update(appData)
        .eq('id', id)
        .select();

      if (err) throw err;
      await refetch();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteApp = async (id) => {
    try {
      const { error: err } = await supabase
        .from('apps')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await refetch();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { apps, loading, error, refetch, createApp, updateApp, deleteApp };
}
