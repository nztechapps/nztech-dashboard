/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nz-primary': '#00E5A0',
        'nz-dark': '#0A0A0F',
        'nz-surface': '#13131A',
        'nz-purple': '#7C6AFF',
      },
      fontFamily: {
        'syne': ['Syne', 'sans-serif'],
        'dm-mono': ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
