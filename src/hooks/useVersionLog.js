import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useVersionLog(appId) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appId) {
      fetchVersions();
    }
  }, [appId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('version_log')
        .select('*')
        .eq('app_id', appId)
        .order('fecha', { ascending: false });

      if (err) throw err;
      setVersions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addVersion = async (data) => {
    try {
      const { error: err } = await supabase
        .from('version_log')
        .insert([{
          app_id: appId,
          version: data.version,
          fecha: data.fecha,
          cambios: data.cambios,
        }]);

      if (err) throw err;
      await fetchVersions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteVersion = async (id) => {
    try {
      const { error: err } = await supabase
        .from('version_log')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await fetchVersions();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { versions, loading, error, addVersion, deleteVersion };
}
