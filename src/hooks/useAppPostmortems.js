import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAppPostmortems(ideaId) {
  const [loading, setLoading] = useState(false);
  const [postmortem, setPostmortem] = useState(null);

  useEffect(() => {
    if (!ideaId) return;
    setLoading(true);
    supabase
      .from('app_postmortems')
      .select('*')
      .eq('idea_id', ideaId)
      .maybeSingle()
      .then(({ data }) => {
        setPostmortem(data || null);
        setLoading(false);
      });
  }, [ideaId]);

  const savePostmortem = async (data) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('app_postmortems')
        .upsert({ idea_id: ideaId, ...data }, { onConflict: 'idea_id' });
      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, postmortem, savePostmortem };
}
