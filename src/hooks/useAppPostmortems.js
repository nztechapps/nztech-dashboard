import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAppPostmortems() {
  const [loading, setLoading] = useState(false);

  const savePostmortem = async (ideaId, data) => {
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

  return { loading, savePostmortem };
}
