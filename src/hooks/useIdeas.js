import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async (filters = {}) => {
    try {
      setLoading(true);
      let query = supabase.from('ideas').select('*');

      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      if (filters.mercado) {
        query = query.eq('mercado', filters.mercado);
      }

      const { data, error: err } = await query.order('created_at', { ascending: false });

      if (err) throw err;
      setIdeas(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createIdea = async (data) => {
    try {
      const { error: err } = await supabase.from('ideas').insert([data]);
      if (err) throw err;
      await fetchIdeas();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateIdea = async (id, data) => {
    try {
      const { error: err } = await supabase
        .from('ideas')
        .update(data)
        .eq('id', id);
      if (err) throw err;
      await fetchIdeas();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteIdea = async (id) => {
    try {
      const { error: err } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);
      if (err) throw err;
      await fetchIdeas();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { ideas, loading, error, fetchIdeas, createIdea, updateIdea, deleteIdea };
}
