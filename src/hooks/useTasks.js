import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .neq('estado', 'done')
        .order('prioridad', { ascending: true });

      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { tasks, loading, error };
}
