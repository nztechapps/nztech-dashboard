# REMODELACIÓN NZTECH DASHBOARD — PLAN ARQUITECTÓNICO

**Fecha:** 2026-05-06  
**Autor:** Auditoría Estructural del Proyecto  
**Scope:** Análisis de viabilidad para 10 cambios principales (SIN implementación)

---

## 1. ESTADO ACTUAL

### Rutas y Páginas Funcionales
| Ruta | Componente | Estado | Notas |
|------|-----------|--------|-------|
| `/` | Home | ✓ Parcial | Dashboard básico, sin "Daily Brief" ni zonas rediseñadas |
| `/apps` | Apps | ✓ Funcional | Listado de apps, no hay integración con ideas unificadas |
| `/apps/:id` | AppDetail | ✓ Funcional | 4 tabs: Producción, Métricas, ASO, Versiones |
| `/ideas` | Ideas | ✓ Funcional | Listado de ideas separado de apps |
| `/ideas/:id` | IdeaDetail | ✓ Funcional | 7 tabs actuales: Info, Research, Specs, Pipeline, Calidad, Publicación, Screenshots |
| `/tareas` | Tareas | ✓ Funcional | Kanban moderno con bloques_tareas |
| `/pipeline` | Pipeline | ✓ Funcional | Control de ejecuciones (realtime) |
| `/finanzas` | Finanzas | ✓ Funcional | Gráficos de revenue y gastos |
| Otros | Calendario, Notificaciones, Agentes, Reportes | ⚠️ Parcial | Funcionalidad limitada o incompleta |

### Estructura de Datos de Ideas vs Apps

**Tabla `ideas` (Supabase)**
- Campos: id, nombre, descripcion, estado, categoria, mercado, prioridad, created_at, updated_at
- Campos Research: research_mercado, research (JSON)
- Campos Specs: specs_pantallas, specs_flujos, specs_apis, complejidad
- Campos Pipeline: pipeline_run_id, github_url
- Campos Calidad: checklist_calidad (JSON)
- **NO tiene campo `publicada`** — se diferencia por estar en tabla separada

**Tabla `apps` (Supabase)**
- Campos: id, nombre, descripcion, status, platform, package, icono_url, mercado, created_at, updated_at
- **DUPLICA conceptualmente con `ideas`** pero son tablas separadas

**Problema:** Ideas y Apps son la misma entidad; la separación es confusa y requiere duplicación en UI.

### Componente IdeaDetail — Estructura Actual

**Tabs implementados (7 total):**
1. **Info** — Nombre, descripción, público, categoría, mercado, prioridad
2. **Research** — Competidores, público objetivo, propuesta de valor, ASO, monetización, APIs
3. **Specs** — Pantallas, flujos, APIs, complejidad
4. **Pipeline** — Enlace a repo GitHub, estado del run
5. **Calidad** — Checklist de 6 items (Firebase, AdMob, Screenshots, Release Build, ASO, Privacidad)
6. **Publicación** — Checklist: google-services.json, App ID, Unit ID, Build, Firma, Screenshots, ASO, Privacidad, Clasificación, Seguridad de datos
7. **Screenshots** — Vista de screenshots generados en el pipeline

**Reutilizable:** El patrón de edición inline, parseo de JSON, y tabs con swipe-support es sólido.

### Hooks Sin Usar en UI (Datos Existentes pero No Expuestos)

| Hook | Tabla | Uso Actual | Problema |
|------|-------|-----------|----------|
| `useAsoTracker` | aso_tracker | Solo importado en AppDetail, pero datos no mostrados | ⚠️ No expuesto |
| `useVersionLog` | version_log | Solo importado en AppDetail, datos no mostrados | ⚠️ No expuesto |
| `useResearch` | research | Existe pero nunca importado en ninguna página | ❌ Muerto |

**Conclusión:** useResearch es código muerto. useAsoTracker y useVersionLog tienen datos que pueden reutilizarse.

### Conflictos Detectados

**Conflicto A: Tasks vs Tareas**
- Tabla `tasks` + `useTasksForApp()` — Antigua, usada en AppDetail para Kanban de producción
- Tabla `tareas` + `bloques_tareas` + `useTareas()` — Nueva, usada en página Tareas.jsx (Kanban moderno)
- **Problema:** Dos sistemas paralelos; confusión sobre cuál es "la verdadera"
- **Resolución recomendada (en orden de implementación):** Consolidar hacia `tareas` + `bloques_tareas`; deprecar `tasks`

**Conflicto B: Ideas vs Apps — Separación Artificial**
- `useIdeas()` → tabla `ideas` (para ideas en desarrollo)
- `useApps()` → tabla `apps` (para apps publicadas)
- **Problema:** Son el mismo objeto lógico; la separación duplica código en UI
- **Resolución:** Unificar en tabla única `apps` con campo `publicada: boolean`; migrar `ideas` → `apps`

**Conflicto C: Design System Hardcodeado**
- Colores dispersos en inline styles por todo el código
- No existe archivo centralizado de tokens
- **Problema:** Cambio visual (dark → light) requiere editar 100+ líneas en múltiples archivos
- **Resolución:** Crear `src/styles/tokens.js` antes de CAMBIO 9

---

## 2. ANÁLISIS POR CAMBIO PROPUESTO

### CAMBIO 1: Unificación Ideas + Apps

**Descripción:**
Ideas y Apps son el mismo objeto. `publicada: boolean` determina dónde aparecen.
- Ideas no publicadas → sidebar "Ideas" → flujo de 7 etapas
- Ideas publicadas → sidebar "Apps" → detalles de app en producción

**Impacto Técnico:**

1. **Migraciones de DB:**
   - Agregar columna `publicada: boolean DEFAULT false` a tabla `ideas`
   - Opcionalmente: renombrar tabla `ideas` → `apps_dev` o mantener ambas con relación
   - Copiar datos existentes de tabla `apps` a tabla `ideas` (si se unifica)

2. **Componentes a Refactorizar:**
   - `src/pages/Apps.jsx` — Filtrar ideas donde `publicada = true` usando `useIdeas()` en lugar de `useApps()`
   - `src/pages/Ideas.jsx` — Filtrar ideas donde `publicada = false`
   - `src/pages/AppDetail.jsx` → Cambiar a consumir `useIdeas()` en lugar de `useApps()`
   - `src/components/layout/Sidebar.jsx` — Actualizar rutas (posiblemente consolidar)

3. **Problemas a Resolver:**
   - ¿Mantener tabla `apps` para datos históricos o deprecarla completamente?
   - ¿Qué sucede con relaciones (tasks ↔ apps)?
   - ¿Control de transición:** Hacer migraciones y luego deprecar `useApps()`, o mantener ambas en paralelo?

4. **Esfuerzo:** ALTO (requiere migraciones DB + cambios en 5+ componentes)

**Recomendación:** Implementar después de CAMBIO 10 (limpieza tasks/tareas), para tener un codebase más limpio.

---

### CAMBIO 2: Nuevo Flujo de 7 Etapas en IdeaDetail

**Descripción:**
Reemplazar/expandir los 7 tabs actuales en un flujo progresivo que marca completitud.

**Tabs actuales vs. Nuevos Flujos:**

| Tab Actual | Flujo Propuesto | Cambio |
|-----------|-----------------|--------|
| Info | 1. Info base | ✓ Igual |
| Research | 2. Validador (agente N8N) | 🔄 Renombrado + Automático |
| Specs | 3. Research (agente N8N) + 4. Specs (agente N8N) | 🔄 Dividido en 2 etapas |
| Pipeline | 5. Pipeline (genera app) | ✓ Igual |
| Calidad | 6. Preparación Play Console | ✓ Renombrado |
| Publicación | (Merge con 6) | 🔄 Combinado |
| Screenshots | (Merge con 6) | 🔄 Combinado |

**Nuevas Etapas:**
1. **Info base** — nombre, descripción, público, categoría, mercado, prioridad
2. **Validador** — Agente N8N: "¿vale la pena hacer esta app?" → sí/no → decisión
3. **Research** — Agente N8N: competidores, keywords, oportunidades
4. **Specs** — Agente N8N: pantallas, flujos, APIs, complejidad estimado
5. **Pipeline** — Genera la app, enlace a repo (editable)
6. **Preparación Play Console** — Checklist unificado (Firebase, AdMob, Screenshots, etc.)
7. **ASO** — Keywords optimizadas, título, descripción

**Después de Publicación — Cuestionario Post-Mortem:**

Formulario con 5 preguntas:
```
1. ¿Qué fue lo más difícil del proceso?
2. ¿Qué salió mejor de lo esperado?
3. ¿Qué mejorarías del pipeline para la próxima app?
4. ¿Cuánto tiempo tomó cada etapa? (estimado)
5. Puntaje general del proceso (1-10)
```

Respuestas guardadas en tabla `app_postmortems` (NUEVA).

Claude analiza respuestas acumuladas → genera insights para mejorar pipeline.

**Impacto Técnico:**

1. **Tablas Nuevas Necesarias:**
   ```sql
   CREATE TABLE app_postmortems (
     id UUID PRIMARY KEY,
     app_id BIGINT REFERENCES apps(id) ON DELETE CASCADE,
     respuesta_dificultad TEXT,
     respuesta_exito TEXT,
     respuesta_mejoras TEXT,
     tiempos_estimados JSON, -- {info, validador, research, specs, pipeline, publicacion, aso}
     puntaje INT CHECK(puntaje >= 1 AND puntaje <= 10),
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Componentes a Crear/Modificar:**
   - `src/pages/IdeaDetail.jsx` — Expandir lógica de tabs, agregar etapas 2-4 con llamadas a agentes
   - `src/components/ideaDetail/PostMortemModal.jsx` — NUEVO formulario post-publicación
   - `src/hooks/useAppPostmortems.js` — NUEVO hook para CRUD

3. **Integraciones Externas:**
   - Llamadas a agentes N8N (puntos 2, 3, 4)
   - Guardar respuestas y generar insights (Claude API o agente)

4. **Esfuerzo:** MUY ALTO (lógica compleja, nuevas APIs, nuevas tablas)

**Bloqueante:** ¿Los agentes N8N (Validador, Research, Specs) están configurados? ¿Hay endpoints disponibles?

---

### CAMBIO 3: AppDetail con Tabs Nuevos

**Descripción:**
Una vez publicada la app, mostrar:
- **ASO Tracker** — ranking por keyword, historial
- **Stats** — installs, revenue, ratings, crashes (Play Console API)
- **Info** — links editables: AdMob, Play Console, Canva Logo, Canva Screenshots

**Impacto Técnico:**

1. **Tablas Existentes:**
   - `aso_tracker` — Ya existe, useAsoTracker ya está en AppDetail (línea 15 de AppDetail.jsx)
   - `version_log` — Ya existe, useVersionLog ya está en AppDetail (línea 16)

2. **Componentes a Modificar:**
   - `src/pages/AppDetail.jsx` — Cambiar estructura de tabs
   - Actualizar lógica para mostrar datos de `aso_tracker` (actualmente cargados pero no mostrados)

3. **Play Console API:**
   - Requiere OAuth2 + credenciales
   - Implementación: nuevo hook `usePlayConsoleMetrics(appId)`

4. **Esfuerzo:** MEDIO (datos ya existen, solo falta exposición en UI)

**Dependencia:** CAMBIO 1 (unificación Ideas/Apps debe estar listo primero)

---

### CAMBIO 4: Home Rediseñado en 5 Zonas

**Descripción:**
Dashboard con 5 secciones:

**Zona 1 — Daily Brief:**
- Saludo + foco del día (sugerido por Claude basado en tareas pendientes)
- Widget pipeline activo (run en curso o último run)
- 3 tareas más urgentes del día
- Encuesta semanal (si es lunes)
- Alertas automáticas (rating bajo, crashes, ideas sin avanzar)

**Zona 2 — KPIs Globales (4 cards):**
- Revenue mensual total (de tabla `metrics`)
- Apps publicadas / objetivo 50 (de tabla `apps`)
- Ideas en curso (de tabla `ideas` donde publicada = false)
- YouTube subs (manual input o API)

**Zona 3 — Apps Snapshot:**
- Cards de apps publicadas con DAU, revenue, rating
- Cards de ideas en pipeline con estado actual

**Zona 4 — Contenido Snapshot:**
- YouTube: views, watch time, último video
- Instagram/TikTok: reach, engagement (carga manual)
- Guiones: recientes con estado (borrador/grabado/publicado)

**Zona 5 — Finanzas + Productividad:**
- Resumen financiero del mes (ingresos, gastos, balance, margen)
- Score de productividad última semana + racha de encuestas completadas

**Impacto Técnico:**

1. **Tablas Nuevas (para datos no existentes):**
   - `youtube_metrics` — views, watch_time, created_at (para seguimiento histórico)
   - `social_metrics` — plataforma, fecha, views, seguidores, likes, reach, engagement
   - `productivity_surveys` — semana, respuestas (JSON), reporte_claude, created_at
   - `guiones` — formato, tema, hook, guion, status, plataforma, created_at

2. **Hooks a Crear:**
   - `useYoutubeMetrics()` — Integración con YouTube Data API v3
   - `useSocialMetrics()` — Para Instagram/TikTok
   - `useProductivitySurveys()` — Para encuestas semanales
   - `useGuiones()` — Para guiones

3. **Cambios en Home.jsx:**
   - Estructura de 5 zonas
   - Llamadas a múltiples hooks
   - Generación de "foco del día" (¿con Claude API?)

4. **Esfuerzo:** ALTO (múltiples nuevas integraciones, nuevas tablas)

**Bloqueantes:**
- ¿Integración YouTube Data API v3 ya disponible?
- ¿Cómo se cargan métricas de Instagram/TikTok? (¿manual o API?)
- ¿Cómo se genera "foco del día"? (¿lógica interna o llamada a Claude API?)

---

### CAMBIO 5: Knowledge Base

**Descripción:**
Nueva sección en sidebar ("Manuales") con editor tipo Notion.

Tabla: `knowledge_base`
- titulo, categoria, contenido (markdown), tags, created_at, updated_at

**Impacto Técnico:**

1. **Tabla Nueva:**
   ```sql
   CREATE TABLE knowledge_base (
     id UUID PRIMARY KEY,
     titulo TEXT NOT NULL,
     categoria TEXT, -- técnico, marketing, ASO, legal, operaciones
     contenido TEXT, -- markdown
     tags TEXT[], -- array de tags
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Componentes a Crear:**
   - `src/pages/KnowledgeBase.jsx` — NUEVA página
   - `src/hooks/useKnowledgeBase.js` — NUEVO hook CRUD

3. **Librería Editor Rich:**
   - Opciones: `react-markdown`, `slate`, `tiptap`, `monaco-editor`
   - Recomendación: `react-markdown` + `textarea` simple (Markdown es suficiente para un solo usuario)
   - Alternativa premium: `tiptap` (editor WYSIWYG robusto)

4. **Esfuerzo:** BAJO (es una tabla simple + página CRUD)

---

### CAMBIO 6: Generador de Guiones

**Descripción:**
Nueva sección ("Guiones") con dos agentes Claude:
- **Cortos** (TikTok/YouTube Shorts): trending angle + hook 3s + guión 30-60s + CTA
- **YouTube:** título SEO + estructura narrativa + guión completo + timestamps

Tabla: `guiones`
- formato, tema, hook, guion, status, plataforma, created_at

**Impacto Técnico:**

1. **Tabla Nueva:**
   ```sql
   CREATE TABLE guiones (
     id UUID PRIMARY KEY,
     formato TEXT, -- short, youtube
     tema TEXT,
     hook TEXT,
     guion TEXT,
     status TEXT DEFAULT 'borrador', -- borrador, grabado, publicado
     plataforma TEXT, -- tiktok, youtube-shorts, youtube
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Componentes a Crear:**
   - `src/pages/Guiones.jsx` — NUEVA página
   - `src/hooks/useGuiones.js` — NUEVO hook CRUD
   - `src/components/guiones/GenerateGuionModal.jsx` — Llamadas a Claude API

3. **Integraciones Externas:**
   - Claude API (vía backend o directamente desde frontend con Anthropic SDK)
   - Prompts específicos para cada formato

4. **Esfuerzo:** MEDIO (necesita integración Claude API bien pensada)

**Decisión de Arquitectura:** ¿Llamadas a Claude desde frontend (Anthropic SDK) o desde backend (server.js)?
- Frontend: Más simple, menor latencia
- Backend: Más seguro, mejor control de tokens, puede guardar llamadas en cache

---

### CAMBIO 7: Métricas de Redes Sociales

**Descripción:**
Nueva sección ("Social") con tabla `social_metrics`.

**YouTube:** Conectado automático vía YouTube Data API v3  
**Instagram/TikTok:** Carga manual semanal

**Impacto Técnico:**

1. **Tabla Nueva:**
   ```sql
   CREATE TABLE social_metrics (
     id UUID PRIMARY KEY,
     plataforma TEXT, -- youtube, instagram, tiktok
     fecha DATE,
     views BIGINT,
     seguidores BIGINT,
     likes BIGINT,
     reach BIGINT,
     engagement_rate FLOAT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Componentes a Crear:**
   - `src/pages/Social.jsx` — NUEVA página
   - `src/hooks/useSocialMetrics.js` — NUEVO hook
   - `src/components/social/YouTubeSync.jsx` — Conexión OAuth YouTube

3. **Integraciones Externas:**
   - YouTube Data API v3 (requiere OAuth2 + API key)
   - Scopes necesarios: `youtube.readonly`

4. **Esfuerzo:** MEDIO-ALTO (requiere OAuth2 setup)

---

### CAMBIO 8: Encuestas de Productividad

**Descripción:**
Nueva sección ("Productividad") con encuesta semanal automática.

Tabla: `productivity_surveys`
- semana, respuestas (JSON), reporte_claude, acciones_sugeridas, created_at

**Encuesta:**
- 5 preguntas fijas + 1-2 variables
- Claude analiza respuestas → genera reporte + acciones

**Impacto Técnico:**

1. **Tabla Nueva:**
   ```sql
   CREATE TABLE productivity_surveys (
     id UUID PRIMARY KEY,
     semana TEXT, -- "2026-W18"
     respuestas JSONB, -- {p1: string, p2: string, ...}
     reporte_claude TEXT,
     acciones_sugeridas TEXT[],
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Componentes a Crear:**
   - `src/pages/Productividad.jsx` — NUEVA página
   - `src/hooks/useProductivitySurveys.js` — NUEVO hook
   - `src/components/productividad/WeeklySurveyModal.jsx` — Modal de encuesta

3. **Lógica:**
   - Detectar lunes automáticamente
   - Mostrar encuesta si no está completada (cron job o flag en página)
   - Llamada a Claude API para analizar respuestas

4. **Esfuerzo:** MEDIO (requiere integración Claude API + lógica de "lunes")

---

### CAMBIO 9: Rediseño Visual — Light Mode Profesional

**Descripción:**
Cambiar de dark mode a light mode limpio.

**Antes (Dark):**
- Fondo: #0A0A0F (negro muy oscuro)
- Superficie: #13131A
- Acento: #00E5A0 (verde)
- Texto: white, rgba(255,255,255,0.7)

**Después (Light):**
- Fondo: #FFFFFF o #F9FAFB
- Superficie: #FFFFFF con border sutil
- Acento: #00E5A0 (verde, mantener)
- Texto: #1F2937 (gris oscuro)

**Impacto Técnico:**

1. **Centralización de Tokens:**
   ```javascript
   // src/styles/tokens.js
   export const colors = {
     primary: '#00E5A0',
     background: '#F9FAFB',
     surface: '#FFFFFF',
     border: 'rgba(0,0,0,0.08)',
     text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF' },
     status: { success: '#10B981', error: '#EF4444', warning: '#F59E0B', info: '#3B82F6' },
   };
   ```

2. **Componentes a Refactorizar:**
   - Todos los archivos que usan inline styles con colores hardcodeados
   - Estimación: 50+ archivos

3. **Problemas a Anticipar:**
   - Algunos componentes pueden verse mal con luz (bajo contraste)
   - Bordes y separadores necesitarán ajuste visual
   - Gráficos (recharts) pueden necesitar recoloración

4. **Esfuerzo:** ALTO (toque cada componente)

**Recomendación:** 
- Crear `tokens.js` ANTES de hacer cambios
- Refactorizar gradualmente por región (layout, ui, pages)
- Usar find & replace cuidadoso (manual para colores hardcodeados)

---

### CAMBIO 10: Limpieza Tasks/Tareas

**Descripción:**
Eliminar tabla `tasks` y sus hooks. Migrar todo a `tareas` + `bloques_tareas`.

**Problema Actual:**
- `useTasks()` — tabla `tasks` (antigua, parcialmente usada)
- `useTasksForApp()` — tabla `tasks` (usada en AppDetail)
- `useTareas()` — tabla `tareas` + `bloques_tareas` (nueva, usada en Tareas.jsx)

**Solución:**
1. Copiar datos de `tasks` a `tareas` (con conversión de campos si es necesario)
2. Actualizar `useTasksForApp()` para consumir tabla `tareas` en lugar de `tasks`
3. Eliminar `useTasks()` (no se usa en ningún lado)
4. Deprecar tabla `tasks`

**Impacto Técnico:**

1. **Cambios en Components:**
   - `src/pages/AppDetail.jsx` — Cambiar `useTasksForApp` para usar `tareas` en lugar de `tasks`
   - `src/components/apps/KanbanBoard.jsx` — Verificar que funciona con estructura de `tareas`
   - Eliminar `src/hooks/useTasks.js` (código muerto)

2. **Migración de Datos:**
   - Querydatastring: `INSERT INTO tareas (bloque_id, titulo, descripcion, ...) SELECT ... FROM tasks`
   - Requiere mapping de campos (tasks.estado → tareas.estado, etc.)

3. **Esfuerzo:** MEDIO (migración simple si mapeo es directo)

**Bloqueante:** ¿El mapeo entre `tasks` y `tareas` es directo (1:1) o requiere transformación?

---

## 3. ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Limpieza (CAMBIO 10)
**Razón:** Reduce deuda técnica; facilita cambios posteriores
1. Migrar datos de `tasks` → `tareas`
2. Actualizar `useTasksForApp()`
3. Deprecar `tasks` + `useTasks.js`

**Tiempo estimado:** 1-2 horas

---

### Fase 2: Infraestructura Visual (CAMBIO 9)
**Razón:** Si el usuario quiere light mode, cambiar antes de agregar nuevas páginas
1. Crear `src/styles/tokens.js`
2. Refactorizar componentes por región
3. Testear visualmente

**Tiempo estimado:** 4-6 horas

---

### Fase 3: Consolidación de Datos (CAMBIO 1)
**Razón:** Unificar Ideas/Apps permite diseñar mejor el resto de cambios
1. Agregar columna `publicada` a tabla `ideas`
2. Copiar datos de `apps` a `ideas`
3. Refactorizar `Ideas.jsx` y `Apps.jsx` para filtrar por `publicada`
4. Deprecar `useApps()` o mantener solo para compatibilidad

**Tiempo estimado:** 2-3 horas

---

### Fase 4: Nuevas Páginas Simples (CAMBIO 5 + 7)
**Razón:** Bajo riesgo, no interfieren con flujos existentes
1. Crear `KnowledgeBase.jsx` (CAMBIO 5)
2. Crear `Social.jsx` (CAMBIO 7)
3. Agregar hooks correspondientes
4. Agregar rutas en Sidebar

**Tiempo estimado:** 4-5 horas total

---

### Fase 5: Nuevas Características con Integraciones (CAMBIO 6 + 8)
**Razón:** Requieren decisiones arquitectónicas (frontend vs backend para Claude API)
1. Crear `Guiones.jsx` (CAMBIO 6)
2. Crear `Productividad.jsx` (CAMBIO 8)
3. Integrar Claude API (decisión: frontend o backend?)
4. Implementar lógica de "lunes automático"

**Tiempo estimado:** 6-8 horas total

---

### Fase 6: Expansión Home (CAMBIO 4)
**Razón:** Depende de tareas anteriores; agrega complejidad en una página clave
1. Crear `useYoutubeMetrics()`, `useSocialMetrics()`, `useProductivitySurveys()`
2. Refactorizar `Home.jsx` en 5 zonas
3. Integrar "foco del día" (lógica simple o Claude API?)

**Tiempo estimado:** 5-7 horas

---

### Fase 7: Flujo Complejo IdeaDetail (CAMBIO 2)
**Razón:** Mayor complejidad; depende de agentes N8N configurados
1. Expandir IdeaDetail con etapas 2-4 (llamadas a agentes N8N)
2. Crear componente `PostMortemModal`
3. Crear tabla `app_postmortems`
4. Integrar análisis de insights

**Tiempo estimado:** 8-12 horas

---

### Fase 8: AppDetail Mejorado (CAMBIO 3)
**Razón:** Depende de CAMBIO 1 (unificación Ideas/Apps)
1. Refactorizar `AppDetail.jsx` con nuevos tabs
2. Exponer datos de `aso_tracker` (ya existen, solo falta UI)
3. Integración Play Console API (opcional, compleja)

**Tiempo estimado:** 3-4 horas (sin Play Console); 6-8 horas (con Play Console)

---

## 4. MIGRACIONES DE DB NECESARIAS

### Fase 1: Limpieza (CAMBIO 10)
```sql
-- Copiar datos de tasks a tareas (si mapping es directo)
INSERT INTO tareas (titulo, descripcion, estado, created_at, updated_at, bloque_id)
SELECT title, description, status, created_at, updated_at, NULL FROM tasks
WHERE app_id IS NOT NULL;

-- Verificar integridad
SELECT COUNT(*) FROM tareas; -- Debería ser mayor que antes

-- Deprecar tabla (NO borrar, solo deshabilitar)
ALTER TABLE tasks DISABLE TRIGGER ALL;
-- O:
-- DROP TABLE tasks; -- Solo si estás seguro de que no hay datos críticos
```

### Fase 2: Infraestructura Visual (CAMBIO 9)
```sql
-- No requiere cambios en DB
```

### Fase 3: Consolidación de Datos (CAMBIO 1)
```sql
-- Agregar columna a ideas
ALTER TABLE ideas ADD COLUMN publicada BOOLEAN DEFAULT FALSE;

-- Copiar datos de apps a ideas (si se unifica completamente)
-- Esto es DESTRUCTIVO; considerar primero cuál es la "tabla maestra"
INSERT INTO ideas (nombre, descripcion, status, platform, package, icono_url, mercado, publicada, created_at, updated_at)
SELECT name, description, status, platform, package, icono_url, mercado, TRUE, created_at, updated_at FROM apps;

-- Verificar
SELECT COUNT(*) FROM ideas WHERE publicada = TRUE;
SELECT COUNT(*) FROM ideas WHERE publicada = FALSE;
```

### Fase 4: Nuevas Páginas Simples (CAMBIO 5 + 7)
```sql
-- CAMBIO 5: Knowledge Base
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  categoria TEXT, -- técnico, marketing, ASO, legal, operaciones
  contenido TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- CAMBIO 7: Social Metrics
CREATE TABLE social_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plataforma TEXT NOT NULL, -- youtube, instagram, tiktok
  fecha DATE,
  views BIGINT,
  seguidores BIGINT,
  likes BIGINT,
  reach BIGINT,
  engagement_rate FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fase 5: Nuevas Características con Integraciones (CAMBIO 6 + 8)
```sql
-- CAMBIO 6: Guiones
CREATE TABLE guiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formato TEXT NOT NULL, -- short, youtube
  tema TEXT,
  hook TEXT,
  guion TEXT,
  status TEXT DEFAULT 'borrador', -- borrador, grabado, publicado
  plataforma TEXT, -- tiktok, youtube-shorts, youtube
  created_at TIMESTAMP DEFAULT NOW()
);

-- CAMBIO 8: Productivity Surveys
CREATE TABLE productivity_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semana TEXT NOT NULL, -- 2026-W18
  respuestas JSONB, -- {pregunta1: respuesta, pregunta2: respuesta, ...}
  reporte_claude TEXT,
  acciones_sugeridas TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(semana) -- Solo una encuesta por semana
);

-- Tabla para historial de YouTube
CREATE TABLE youtube_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE,
  views BIGINT,
  watch_time_hours FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fase 6: Expansión Home (CAMBIO 4)
```sql
-- Actualizar youtube_metrics si no existe
-- (Creada en Fase 5)
-- social_metrics ya creada en Fase 4
```

### Fase 7: Flujo Complejo IdeaDetail (CAMBIO 2)
```sql
-- CAMBIO 2: App Post-mortems
CREATE TABLE app_postmortems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id BIGINT NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  respuesta_dificultad TEXT,
  respuesta_exito TEXT,
  respuesta_mejoras TEXT,
  tiempos_estimados JSONB, -- {info: 30, validador: 45, research: 120, ...}
  puntaje INT CHECK(puntaje >= 1 AND puntaje <= 10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Resumen de Tablas Nuevas
| Tabla | Fase | Cambio | SQL |
|-------|------|--------|-----|
| `knowledge_base` | 4 | 5 | ✓ Arriba |
| `social_metrics` | 4 | 7 | ✓ Arriba |
| `guiones` | 5 | 6 | ✓ Arriba |
| `productivity_surveys` | 5 | 8 | ✓ Arriba |
| `youtube_metrics` | 5 | 4 | ✓ Arriba |
| `app_postmortems` | 7 | 2 | ✓ Arriba |

### Cambios a Tablas Existentes
| Tabla | Columna | Cambio | Fase |
|-------|---------|--------|------|
| `ideas` | `publicada` | ADD BOOLEAN DEFAULT FALSE | 3 |
| `tasks` | (todas) | DEPRECATE (opcional: DROP) | 1 |

---

## 5. COMPONENTES A CREAR

### Nuevas Páginas
```
src/pages/
├── KnowledgeBase.jsx        (CAMBIO 5)
├── Social.jsx               (CAMBIO 7)
├── Guiones.jsx              (CAMBIO 6)
├── Productividad.jsx        (CAMBIO 8)
```

### Nuevos Hooks
```
src/hooks/
├── useKnowledgeBase.js      (CAMBIO 5)
├── useSocialMetrics.js      (CAMBIO 7)
├── useGuiones.js            (CAMBIO 6)
├── useProductivitySurveys.js (CAMBIO 8)
├── useYoutubeMetrics.js     (CAMBIO 4)
├── useAppPostmortems.js     (CAMBIO 2)
```

### Componentes UI/Modales
```
src/components/
├── guiones/
│   └── GenerateGuionModal.jsx (CAMBIO 6)
├── productividad/
│   ├── WeeklySurveyModal.jsx (CAMBIO 8)
│   └── InsightsCard.jsx       (CAMBIO 8)
├── social/
│   ├── YouTubeSync.jsx        (CAMBIO 7)
│   └── MetricsCard.jsx        (CAMBIO 7)
├── ideaDetail/
│   ├── PostMortemModal.jsx    (CAMBIO 2)
│   └── StageProgressBar.jsx   (CAMBIO 2)
├── knowledgeBase/
│   ├── ArticleEditor.jsx      (CAMBIO 5)
│   └── CategoryFilter.jsx     (CAMBIO 5)
└── home/
    ├── DailyBrief.jsx         (CAMBIO 4)
    ├── KPIsGrid.jsx           (CAMBIO 4)
    ├── AppsSnapshot.jsx       (CAMBIO 4)
    ├── ContentSnapshot.jsx    (CAMBIO 4)
    └── FinancesProductivity.jsx (CAMBIO 4)
```

---

## 6. COMPONENTES A MODIFICAR

### Componentes Críticos
| Componente | Cambios | Razón |
|-----------|---------|-------|
| `src/App.jsx` | Agregar rutas para KnowledgeBase, Social, Guiones, Productividad | CAMBIO 5, 6, 7, 8 |
| `src/components/layout/Sidebar.jsx` | Agregar nav items; posiblemente consolidar Ideas/Apps | CAMBIO 1, 5, 6, 7, 8 |
| `src/pages/Home.jsx` | Rediseño en 5 zonas; nuevas integraciones | CAMBIO 4 |
| `src/pages/Ideas.jsx` | Filtrar por `publicada = false` | CAMBIO 1 |
| `src/pages/Apps.jsx` | Filtrar por `publicada = true`; usar `useIdeas()` | CAMBIO 1 |
| `src/pages/IdeaDetail.jsx` | Expandir con etapas 2-4, agregar PostMortemModal | CAMBIO 2 |
| `src/pages/AppDetail.jsx` | Nuevos tabs (ASO, Stats, Info); cambiar de `useApps()` a `useIdeas()` | CAMBIO 1, 3 |
| `src/components/apps/KanbanBoard.jsx` | Verificar compatibilidad con `tareas` | CAMBIO 10 |
| `src/styles/tokens.js` | CREAR archivo centralizado | CAMBIO 9 |

### Componentes que Consumen Hooks Anticuados
| Hook | Componente | Cambio Requerido |
|------|-----------|------------------|
| `useTasks()` | Ninguno (código muerto) | Eliminar |
| `useTasksForApp()` | AppDetail.jsx (línea 109) | Cambiar a consumir `tareas` |
| `useApps()` | Apps.jsx, AppDetail.jsx, Home.jsx | Cambiar a `useIdeas()` o deprecar |

---

## 7. COMPONENTES A ELIMINAR

```
src/hooks/
├── useTasks.js          (CAMBIO 10 - no se usa)
├── useResearch.js       (Código muerto - nunca importado)
```

Opcional (si se unifica Ideas/Apps completamente):
```
src/hooks/
└── useApps.js           (CAMBIO 1 - reemplazado por useIdeas())
```

---

## 8. PREGUNTAS BLOQUEANTES

Necesito confirmar lo siguiente ANTES de implementar:

### Base de Datos & Arquitectura

**P1.** Sobre CAMBIO 1 (Unificación Ideas/Apps):
- ¿Son IDEAS y APPS literalmente el mismo objeto, o tienen campos distintos?
- ¿Qué sucede con `tasks` si los unificamos? (Actualmente `tasks.app_id` referencia `apps.id`)
- ¿Deprecar tabla `apps` completamente o mantenerla para histórico?

**P2.** Sobre CAMBIO 10 (Limpieza Tasks/Tareas):
- ¿El mapeo entre campos de `tasks` y `tareas` es 1:1?
- ¿Hay datos en `tasks` que NO están en `tareas`?
- ¿Seguro de deprecar la tabla `tasks`?

**P3.** Sobre CAMBIO 2 (Flujo 7 Etapas):
- ¿Los agentes N8N (Validador, Research, Specs) YA EXISTEN y tienen endpoints?
- ¿URLs de los webhooks? (ej: `http://localhost:5678/agentes/validador`)
- ¿Respuesta esperada de cada agente?

**P4.** Sobre CAMBIO 4 (Home Rediseñado):
- ¿"Foco del día sugerido por Claude" es lógica simple (prioridad más urgente) o llamada a Claude API?
- ¿YouTube Data API v3 ya configurado?
- ¿Cómo se cargan métricas de Instagram/TikTok?

**P5.** Sobre CAMBIO 6 (Generador de Guiones):
- ¿Llamadas a Claude API desde FRONTEND (Anthropic SDK) o BACKEND (server.js)?
- ¿Backend server.js puede hacer llamadas a Claude API?

**P6.** Sobre CAMBIO 9 (Light Mode):
- ¿TIMING: cuándo aplicar el cambio visual? (Inicio, fin, o durante implementación?)
- ¿Algún componente que DEBE ser dark (ej: gráficos de recharts)?

### Funcionalidad & Prioridades

**P7.** ¿Cuál es el ORDEN de PRIORIDAD entre CAMBIO 2-9?
- Algunos cambios son independientes; ¿cuáles son críticos PRIMERO?

**P8.** Sobre CAMBIO 3 (AppDetail con Play Console):
- ¿Integración Play Console API es CRÍTICA o OPCIONAL?
- Si es opcional, ¿omitimos Play Console stats por ahora?

**P9.** Sobre CAMBIO 7-8 (Social Metrics & Encuestas):
- ¿La carga de Instagram/TikTok es MANUAL semanal (input form) o SEMIAUTOMÁTICA?
- ¿Encuesta de productividad es FIJA o CONFIGURABLE?

### Design & UI

**P10.** Sobre CAMBIO 9 (Light Mode):
- ¿Preferencia de light mode específica? (blanco puro, gris claro, etc.)
- ¿Mantener verde #00E5A0 como acento o cambiar?

---

## 9. RESUMEN EJECUTIVO

### Estado Actual
- ✓ Infraestructura sólida (Router, Auth, Hooks, Supabase)
- ✓ 13 páginas funcionales, la mayoría con estado activo
- ⚠️ Duplicación conceptual (Ideas vs Apps)
- ⚠️ Dos sistemas de tareas en paralelo
- ❌ Algunas características parcialmente implementadas (ASO Tracker, Version Log, Research)
- ❌ Knowledge Base no existe
- ❌ Home genérico (sin "Daily Brief" ni zonas avanzadas)

### Esfuerzo Total Estimado
- **Fase 1 (Limpieza):** 1-2 h
- **Fase 2 (Visual):** 4-6 h
- **Fase 3 (Consolidación):** 2-3 h
- **Fase 4 (Páginas Simples):** 4-5 h
- **Fase 5 (Integraciones):** 6-8 h
- **Fase 6 (Home):** 5-7 h
- **Fase 7 (Flujo Complejo):** 8-12 h
- **Fase 8 (AppDetail):** 3-8 h (depende de Play Console)

**TOTAL: ~35-55 horas de desarrollo**

### Arquitectura Recomendada

1. **Tablas Maestras:**
   - `ideas` (unificada con `apps`, campo `publicada: boolean`)
   - `tareas` + `bloques_tareas` (única fuente de tareas)
   - 6 nuevas tablas para nuevas funcionalidades

2. **Tokens Centralizados:**
   - `src/styles/tokens.js` con colores, tipografía, espaciado

3. **Hooks Personalizados:**
   - 6 nuevos hooks para nuevas funcionalidades
   - Deprecar `useTasks()` y `useApps()` (o mantener para compatibilidad)

4. **Páginas Nuevas:**
   - 4 páginas nuevas (KnowledgeBase, Social, Guiones, Productividad)
   - 1 página existente rediseñada (Home)
   - 2 páginas modificadas (Ideas/Apps, IdeaDetail)

---

## 10. PRÓXIMOS PASOS

**ANTES de implementar:**
1. ✅ Responder las 10 preguntas bloqueantes (sección 8)
2. ✅ Confirmar orden de implementación (¿fases 1-8 en orden, o diferente?)
3. ✅ Confirmar timing de CAMBIO 9 (light mode)

**DURANTE implementación:**
1. Crear rama `develop` si no existe
2. Feature branches por cambio/fase
3. PRs y code review antes de merge a develop
4. Deploy a producción en milestones (fin de cada fase)

**Documentación:**
- Mantener REMODELACION.md actualizado con progreso
- Crear MIGRATION_GUIDE.md si cambios son disruptivos
- Documentar nuevos hooks en README.md

---

**Auditoría completada:** 2026-05-06  
**Próximo paso:** Confirmar preguntas bloqueantes y comenzar Fase 1.
