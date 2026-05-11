import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAppExperimentos(ideaId) {
  const [experimentos, setExperimentos] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!ideaId) return;
    setLoading(true);
    const { data } = await supabase
      .from('app_experimentos')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });
    setExperimentos(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [ideaId]);

  const createExperimento = async (data) => {
    const { data: row, error } = await supabase
      .from('app_experimentos')
      .insert({ idea_id: ideaId, ...data })
      .select()
      .single();
    if (error) throw error;
    setExperimentos(prev => [row, ...prev]);
    return row;
  };

  const updateExperimento = async (id, data) => {
    const { data: row, error } = await supabase
      .from('app_experimentos')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setExperimentos(prev => prev.map(e => e.id === id ? row : e));
    return row;
  };

  const deleteExperimento = async (id) => {
    const { error } = await supabase.from('app_experimentos').delete().eq('id', id);
    if (error) throw error;
    setExperimentos(prev => prev.filter(e => e.id !== id));
  };

  return { experimentos, loading, createExperimento, updateExperimento, deleteExperimento };
}
