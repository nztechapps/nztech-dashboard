# NZTech Dashboard

## Contexto
Dashboard interno para gestionar el portfolio de apps móviles de NZTech.
Un solo usuario. Stack: React + Vite + Tailwind + Supabase.

## Stack exacto
- React 18 + Vite
- Tailwind CSS v3
- Supabase (@supabase/supabase-js) — proyecto: dvmfjdjfzlylclhjzxbt
- react-router-dom v6
- recharts (gráficos)
- @dnd-kit/core (kanban drag and drop)

## Estructura de carpetas
src/
├── lib/supabase.js
├── hooks/
├── components/layout/
├── components/ui/
├── components/apps/
├── components/tasks/
├── components/metrics/
├── components/notifications/
└── pages/

## Base de datos (Supabase)
Tablas: apps, tasks, metrics, notifications
Ver schema completo en /docs/schema.sql

## Convenciones
- Componentes en PascalCase
- Hooks en camelCase con prefijo "use"
- Variables de entorno en .env.local (nunca hardcodear)
- Tailwind para todo el styling, sin CSS externo
- Sin TypeScript por ahora

## Design system
- Color primario: #00E5A0 (verde NZTech)
- Fondo oscuro: #0A0A0F
- Superficie: #13131A
- Fuentes: Syne (display) + DM Mono (números)
- Dark mode por defecto