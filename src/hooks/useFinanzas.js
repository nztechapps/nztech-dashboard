import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useFinanzas() {
  const [ingresosPorApp, setIngresosPorApp] = useState({});
  const [ingresosPorMercado, setIngresosPorMercado] = useState({});
  const [marMensual, setMarMensual] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanzas();
  }, []);

  const fetchFinanzas = async () => {
    try {
      setLoading(true);

      // Fetch all metrics with app data
      const { data: allMetrics } = await supabase
        .from('metrics')
        .select('*, apps(nombre, mercado)')
        .order('fecha', { ascending: true });

      // Process data
      const appsByMonth = {};
      const marketByMonth = {};
      const appCounts = {};
      const marData = {};

      if (allMetrics) {
        allMetrics.forEach((metric) => {
          const date = new Date(metric.fecha);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const appName = metric.apps?.nombre || 'Unknown';
          const market = metric.apps?.mercado || 'global';

          // Por app
          if (!appsByMonth[monthKey]) appsByMonth[monthKey] = {};
          if (!appsByMonth[monthKey][appName]) appsByMonth[monthKey][appName] = 0;
          appsByMonth[monthKey][appName] += metric.ingresos || 0;

          // Por mercado
          if (!marketByMonth[monthKey]) marketByMonth[monthKey] = {};
          if (!marketByMonth[monthKey][market]) marketByMonth[monthKey][market] = 0;
          marketByMonth[monthKey][market] += metric.ingresos || 0;

          // Count apps activas por mes
          if (!appCounts[monthKey]) appCounts[monthKey] = new Set();
          appCounts[monthKey].add(metric.app_id);
        });
      }

      // Calculate MAR por mes
      Object.keys(appsByMonth).forEach((month) => {
        const totalIngresos = Object.values(appsByMonth[month]).reduce((a, b) => a + b, 0);
        const appCount = appCounts[month]?.size || 1;
        marData[month] = totalIngresos / appCount;
      });

      setIngresosPorApp(appsByMonth);
      setIngresosPorMercado(marketByMonth);
      setMarMensual(marData);
    } catch (err) {
      console.error('Error fetching finanzas:', err);
    } finally {
      setLoading(false);
    }
  };

  return { ingresosPorApp, ingresosPorMercado, marMensual, loading };
}
