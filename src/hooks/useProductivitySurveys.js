import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useProductivitySurveys() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productivity_surveys')
        .select('*')
        .order('semana', { ascending: false });
      if (error) throw error;
      setSurveys(data || []);
    } finally {
      setLoading(false);
    }
  };

  const createSurvey = async (surveyData) => {
    const { data, error } = await supabase
      .from('productivity_surveys')
      .insert([surveyData])
      .select();
    if (error) throw error;
    await fetchSurveys();
    return data[0];
  };

  const getByWeek = (semana) => surveys.find((s) => s.semana === semana);

  return { surveys, loading, createSurvey, getByWeek };
}
