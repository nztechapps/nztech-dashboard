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
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, step = '1') => (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        step={step}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00E5A0]"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Resumen */}
      {last && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Seguidores', value: last.seguidores?.toLocaleString() },
            { label: 'Views', value: last.views?.toLocaleString() },
            { label: 'Engagement', value: `${last.engagement_rate}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#13131A] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="text-xl font-bold text-[#00E5A0] font-mono">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      <div className="bg-[#13131A] border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Cargar métricas del día</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              className="w-full bg-[#0A0A0F] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00E5A0]"
            />
          </div>
          {field('Seguidores', 'seguidores')}
          {field('Views', 'views')}
          {field('Likes', 'likes')}
          {field('Reach', 'reach')}
          {field('Engagement Rate (%)', 'engagement_rate', '0.01')}
          <div className="col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#00E5A0] text-black font-semibold text-sm px-5 py-2 rounded-lg hover:bg-[#00c887] transition disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {msg && <span className="text-xs text-[#00E5A0]">{msg}</span>}
          </div>
        </form>
      </div>

      {/* Gráfico */}
      {data.length > 0 && (
        <div className="bg-[#13131A] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Últimos 30 días</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="fecha" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#13131A', border: '1px solid #ffffff20', borderRadius: 8 }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="views" stroke="#00E5A0" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="seguidores" stroke="#6366f1" dot={false} strokeWidth={2} />
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>
        Social Metrics
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {PLATAFORMAS.map((p) => (
          <button
            key={p}
            onClick={() => setTab(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === p
                ? 'bg-[#00E5A0] text-black'
                : 'bg-[#13131A] text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : (
        <SocialTab plataforma={tab} getByPlataforma={getByPlataforma} createMetric={createMetric} />
      )}
    </div>
  );
}
