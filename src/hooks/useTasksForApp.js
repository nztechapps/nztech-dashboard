import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useTasksForApp(appId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appId) {
      fetchTasks();
    }
  }, [appId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .eq('app_id', appId)
        .order('prioridad', { ascending: true });

      if (err) throw err;
      setTasks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .insert([{ ...taskData, app_id: appId }])
        .select();

      if (err) throw err;
      await fetchTasks();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const { data, error: err } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', id)
        .select();

      if (err) throw err;
      await fetchTasks();
      return data[0];
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      const { error: err } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await fetchTasks();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
