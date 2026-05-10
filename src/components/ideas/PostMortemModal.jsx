import { useState } from 'react';
import { createPortal } from 'react-dom';

const STEPS_CONFIG = [
  { id: 1, question: '¿Qué fue lo más difícil de construir esta app?' },
  { id: 2, question: '¿Qué salió mejor de lo esperado?' },
  { id: 3, question: '¿Qué harías diferente si empezaras de cero?' },
  { id: 4, question: 'Tiempos reales vs estimados (en horas)' },
  { id: 5, question: 'Puntaje general de la experiencia' },
];

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function PostMortemModal({ idea, onClose, onComplete }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    dificultad: '',
    exito: '',
    diferente: '',
    tiempo_disenio: '',
    tiempo_desarrollo: '',
    tiempo_testing: '',
    tiempo_deploy: '',
    puntaje: 5,
  });
  const [loading, setLoading] = useState(false);

  const canAdvance = () => {
    if (step === 1) return answers.dificultad.trim().length > 0;
    if (step === 2) return answers.exito.trim().length > 0;
    if (step === 3) return answers.diferente.trim().length > 0;
    if (step === 4) return answers.tiempo_disenio !== '' && answers.tiempo_desarrollo !== '' && answers.tiempo_testing !== '' && answers.tiempo_deploy !== '';
    return true;
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(s => s + 1);
      return;
    }
    // Last step — call Claude API then save
    setLoading(true);
    try {
      let insight_claude = '';
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (apiKey) {
        const prompt = `Sos un mentor de producto. Basándote en este postmortem de app, generá un insight accionable de 3-4 oraciones que ayude al developer a mejorar en su próximo proyecto.

App: ${idea.titulo}
Descripción: ${idea.descripcion}

Lo más difícil: ${answers.dificultad}
Lo que salió mejor: ${answers.exito}
Qué haría diferente: ${answers.diferente}
Tiempos reales (hs) — Diseño: ${answers.tiempo_disenio}, Desarrollo: ${answers.tiempo_desarrollo}, Testing: ${answers.tiempo_testing}, Deploy: ${answers.tiempo_deploy}
Puntaje general: ${answers.puntaje}/10`;

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
        const json = await res.json();
        insight_claude = json.content?.[0]?.text || '';
      }

      await onComplete({
        dificultad: answers.dificultad,
        exito: answers.exito,
        diferente: answers.diferente,
        tiempos: {
          disenio: Number(answers.tiempo_disenio),
          desarrollo: Number(answers.tiempo_desarrollo),
          testing: Number(answers.tiempo_testing),
          deploy: Number(answers.tiempo_deploy),
        },
        puntaje: answers.puntaje,
        insight_claude,
      });
    } catch (err) {
      console.error('PostMortem error:', err);
      setLoading(false);
    }
  };

  const progressPct = ((step - 1) / (STEPS_CONFIG.length - 1)) * 100;

  const modal = (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', width: '100%', maxWidth: '560px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'var(--text)', fontWeight: '700', fontSize: '16px' }}>Postmortem</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{idea.titulo}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <IconClose />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'var(--surface-2)' }}>
          <div style={{ height: '100%', background: 'var(--primary)', width: `${progressPct}%`, transition: 'width 0.3s ease' }} />
        </div>

        {/* Step indicator */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: '6px', alignItems: 'center' }}>
          {STEPS_CONFIG.map(s => (
            <div
              key={s.id}
              style={{
                width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: '600', flexShrink: 0,
                background: s.id < step ? 'var(--primary)' : s.id === step ? 'var(--primary-soft)' : 'var(--surface-2)',
                color: s.id < step ? 'var(--primary-fg)' : s.id === step ? 'var(--primary)' : 'var(--text-muted)',
                border: s.id === step ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {s.id < step ? '✓' : s.id}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '15px', marginBottom: '16px' }}>
            {STEPS_CONFIG[step - 1].question}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <textarea
              autoFocus
              value={answers.dificultad}
              onChange={e => setAnswers(a => ({ ...a, dificultad: e.target.value }))}
              rows={4}
              placeholder="Describí los mayores desafíos técnicos o de producto..."
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          )}

          {/* Step 2 */}
          {step === 2 && (
            <textarea
              autoFocus
              value={answers.exito}
              onChange={e => setAnswers(a => ({ ...a, exito: e.target.value }))}
              rows={4}
              placeholder="¿Qué superó tus expectativas?"
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          )}

          {/* Step 3 */}
          {step === 3 && (
            <textarea
              autoFocus
              value={answers.diferente}
              onChange={e => setAnswers(a => ({ ...a, diferente: e.target.value }))}
              rows={4}
              placeholder="Si pudieras volver al día 1..."
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
            />
          )}

          {/* Step 4 — tiempos */}
          {step === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { key: 'tiempo_disenio', label: 'Diseño' },
                { key: 'tiempo_desarrollo', label: 'Desarrollo' },
                { key: 'tiempo_testing', label: 'Testing' },
                { key: 'tiempo_deploy', label: 'Deploy' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      value={answers[key]}
                      onChange={e => setAnswers(a => ({ ...a, [key]: e.target.value }))}
                      placeholder="0"
                      style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
                    />
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', flexShrink: 0 }}>hs</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5 — slider */}
          {step === 5 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '48px', fontWeight: '700', color: 'var(--primary)' }}>
                  {answers.puntaje}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '20px', alignSelf: 'flex-end', marginBottom: '8px', marginLeft: '4px' }}>/10</div>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={answers.puntaje}
                onChange={e => setAnswers(a => ({ ...a, puntaje: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Muy malo</span>
                <span>Excelente</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={loading}
                style={{ padding: '10px 20px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: '13px', cursor: 'pointer' }}
              >
                Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canAdvance() || loading}
              style={{
                padding: '10px 24px', background: canAdvance() && !loading ? 'var(--primary)' : 'var(--surface-2)',
                border: 'none', borderRadius: 'var(--radius-sm)', color: canAdvance() && !loading ? 'var(--primary-fg)' : 'var(--text-muted)',
                fontSize: '13px', fontWeight: '600', cursor: canAdvance() && !loading ? 'pointer' : 'not-allowed', transition: 'all 0.2s'
              }}
            >
              {loading ? 'Guardando...' : step === 5 ? 'Publicar app →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
