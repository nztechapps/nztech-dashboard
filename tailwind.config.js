/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy accent (mantenido para compatibilidad)
        'nz-green': '#00E5A0',
        'nz-dark':  '#0A0A0F',
        'nz-surface': '#13131A',
        // CSS-var aliases para usar en clases Tailwind si hace falta
        'nz-primary': 'var(--primary)',
        'nz-bg':      'var(--bg)',
        'nz-text':    'var(--text)',
        'nz-border':  'var(--border)',
      },
      fontFamily: {
        'syne':    ['Syne', 'sans-serif'],
        'dm-mono': ['DM Mono', 'monospace'],
        'inter':   ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'nz-sm':   '6px',
        'nz':      '8px',
        'nz-lg':   '12px',
        'nz-xl':   '16px',
        'nz-pill': '999px',
      },
    },
  },
  plugins: [],
}
