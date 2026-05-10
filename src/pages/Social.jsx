import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSocialMetrics } from '../hooks/useSocialMetrics';

const PLATAFORMAS = ['YouTube', 'Instagram', 'TikTok'];

const EMPTY_FORM = {
  fecha: new Date().toISOString().split('T')[0],
  seguidores: '',
  views: '',
  likes: '',
  reach: '',
  engagement_rate: '',
};

function StatCard({ label, value }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '.06em',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SocialTab({ plataforma, getByPlataforma, createMetric }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const data = getByPlataforma(plataforma).slice(-30);
  const last = data[data.length - 1];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await createMetric({
        plataforma,
        fecha: form.fecha,
        seguidores: Number(form.seguidores),
        views: Number(form.views),
        likes: Number(form.likes),
        reach: Number(form.reach),
        engagement_rate: Number(form.engagement_rate),
      });
      setMsg('Guardado');
      setForm(EMPTY_FORM);
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const numInput = (label, key, step = '1') => (
    <Field label={label}>
      <input
        type="number"
        step={step}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="nz-input"
      />
    </Field>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Stats */}
      {last && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="Seguidores" value={last.seguidores?.toLocaleString()} />
          <StatCard label="Views" value={last.views?.toLocaleString()} />
          <StatCard label="Engagement" value={`${last.engagement_rate}%`} />
        </div>
      )}

      {/* Form */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 24px',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
          Cargar métricas del día
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Fecha">
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              className="nz-input"
            />
          </Field>
          {numInput('Seguidores', 'seguidores')}
          {numInput('Views', 'views')}
          {numInput('Likes', 'likes')}
          {numInput('Reach', 'reach')}
          {numInput('Engagement Rate (%)', 'engagement_rate', '0.01')}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="submit" disabled={saving} className="nz-btn nz-btn-primary">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {msg && (
              <span style={{ fontSize: 12, color: msg.startsWith('Error') ? '#F87171' : 'var(--primary)' }}>
                {msg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Chart */}
      {data.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '20px 24px',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Últimos 30 días
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="fecha" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
                labelStyle={{ color: 'var(--text)' }}
                itemStyle={{ color: 'var(--text-muted)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
              <Line type="monotone" dataKey="views" stroke="var(--primary)" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="seguidores" stroke="#818CF8" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Social() {
  const [tab, setTab] = useState('YouTube');
  const { loading, createMetric, getByPlataforma } = useSocialMetrics();

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
        Social Metrics
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {PLATAFORMAS.map((p) => (
          <button
            key={p}
            onClick={() => setTab(p)}
            style={{
              background: 'none',
              border: 'none',
              color: tab === p ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 500,
              borderBottom: tab === p ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.2s',
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando…</p>
      ) : (
        <SocialTab plataforma={tab} getByPlataforma={getByPlataforma} createMetric={createMetric} />
      )}
    </div>
  );
}
