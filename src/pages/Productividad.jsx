import { useState } from 'react';
import { useProductivitySurveys } from '../hooks/useProductivitySurveys';

const PREGUNTAS = [
  '¿Cuánto avanzaste en tus apps esta semana?',
  '¿Cómo fue tu energía y foco general?',
  '¿Cumpliste los objetivos que te habías puesto?',
  '¿Cuánto tiempo perdiste en cosas no importantes?',
  '¿Cómo te sentís con el ritmo general del proyecto?',
];

const KEYS = ['avance_apps', 'energia_foco', 'cumplimiento_objetivos', 'tiempo_perdido', 'ritmo_general'];

function getCurrentWeek() {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfYear = Math.floor((now - jan4) / 86400000) + jan4.getDay() + 1;
  const week = Math.ceil(dayOfYear / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function scoreColor(score) {
  if (score > 7) return 'text-green-400';
  if (score >= 5) return 'text-yellow-400';
  return 'text-red-400';
}

function Slider({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-300">{label}</span>
        <span className="text-sm font-bold text-[#00E5A0] font-mono w-6 text-right">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#00E5A0]"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>1</span>
        <span>10</span>
      </div>
    </div>
  );
}

export default function Productividad() {
  const { surveys, loading, createSurvey, getByWeek } = useProductivitySurveys();
  const semanaActual = getCurrentWeek();
  const existente = getByWeek(semanaActual);

  const [valores, setValores] = useState({ avance_apps: 5, energia_foco: 5, cumplimiento_objetivos: 5, tiempo_perdido: 5, ritmo_general: 5 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedWeek, setExpandedWeek] = useState(null);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const scores = Object.values(valores);
      const score_promedio = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);

      const prompt = `Sos un coach de productividad para indie developers. Analizá esta encuesta semanal y generá un reporte breve y accionable.

Respuestas (escala 1-10):
- Avance en apps: ${valores.avance_apps}
- Energía y foco: ${valores.energia_foco}
- Cumplimiento de objetivos: ${valores.cumplimiento_objetivos}
- Tiempo perdido (invertido): ${valores.tiempo_perdido}
- Ritmo general: ${valores.ritmo_general}

Generá un párrafo de 3-4 oraciones con: qué salió bien, qué mejorar, y una acción concreta para la próxima semana.`;

      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`Claude API error: ${res.status}`);
      const json = await res.json();
      const reporte_claude = json.content[0].text;

      await createSurvey({
        semana: semanaActual,
        ...valores,
        score_promedio,
        reporte_claude,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const historial = surveys.filter((s) => s.semana !== semanaActual);

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
        Productividad
      </h1>

      {/* Encuesta semanal */}
      <div className="bg-[#13131A] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">Encuesta semanal</h2>
          <span className="text-xs text-gray-400 font-mono">{semanaActual}</span>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : existente ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Ya completaste la encuesta de esta semana.</span>
              <span className={`text-lg font-bold font-mono ${scoreColor(existente.score_promedio)}`}>
                {existente.score_promedio}/10
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed bg-[#0A0A0F] rounded-lg p-4">
              {existente.reporte_claude}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {PREGUNTAS.map((pregunta, i) => (
              <Slider
                key={KEYS[i]}
                label={pregunta}
                value={valores[KEYS[i]]}
                onChange={(v) => setValores((prev) => ({ ...prev, [KEYS[i]]: v }))}
              />
            ))}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-[#00E5A0] text-black font-semibold py-2.5 rounded-lg hover:bg-[#00c887] transition disabled:opacity-50"
            >
              {saving ? 'Analizando con Claude...' : 'Enviar encuesta'}
            </button>
          </div>
        )}
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-white">Historial</h2>
          {historial.map((s) => (
            <div key={s.id} className="bg-[#13131A] border border-white/10 rounded-xl p-4">
              <button
                onClick={() => setExpandedWeek(expandedWeek === s.semana ? null : s.semana)}
                className="w-full flex items-center justify-between"
              >
                <span className="text-sm font-mono text-gray-300">{s.semana}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-base font-bold font-mono ${scoreColor(s.score_promedio)}`}>
                    {s.score_promedio}/10
                  </span>
                  <span className="text-gray-500 text-xs">{expandedWeek === s.semana ? '▲' : '▼'}</span>
                </div>
              </button>
              {expandedWeek === s.semana && (
                <p className="mt-3 text-sm text-gray-300 leading-relaxed bg-[#0A0A0F] rounded-lg p-4">
                  {s.reporte_claude}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
