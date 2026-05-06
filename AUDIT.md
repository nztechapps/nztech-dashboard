# AUDITORÍA DEL DASHBOARD NZTECH

**Fecha:** 2026-05-06  
**Objetivo:** Analizar el estado actual del dashboard e identificar gaps antes de implementar nuevas funcionalidades

---

## 1. INVENTARIO DE ARCHIVOS

### Estructura General
Total de archivos en `src/`: **45+ archivos**

### Distribución por Categoría

#### 📄 Páginas (`src/pages/` - 13 archivos)
- ✓ **Home.jsx** - Dashboard principal con resumen de métricas, apps y tareas
- ✓ **Apps.jsx** - Listado de apps con filtros y búsqueda
- ✓ **AppDetail.jsx** - Detalle de una app individual
- ✓ **Finanzas.jsx** - Gestión de gastos y finanzas
- ✓ **Notificaciones.jsx** - Centro de notificaciones
- ✓ **Agentes.jsx** - Panel de control de agentes autónomos (Legal activo, otros pendientes)
- ✓ **Calendario.jsx** - Calendario con eventos y objetivos mensuales
- ✓ **Pipeline.jsx** - Orquestación del pipeline de apps Android
- ✓ **Reportes.jsx** - Recepción de reportes de agentes
- ✓ **Ideas.jsx** - Listado de ideas/proyectos con búsqueda y filtros
- ✓ **IdeaDetail.jsx** - Detalle completo de una idea con editor inline y checklist
- ✓ **Tareas.jsx** - Gestión de tareas por bloques (Kanban)
- ✓ **Login.jsx** - Autenticación con Supabase

#### 🪝 Hooks Personalizados (`src/hooks/` - 16 archivos)
- ✓ **useAuth.js** - Autenticación y sesión de usuario
- ✓ **useApps.js** - CRUD de apps
- ✓ **useTasks.js** - Gestión de tareas globales (parcialmente usado)
- ✓ **useTasksForApp.js** - Tareas específicas de una app (parcialmente usado)
- ✓ **useMetrics.js** - Métricas de apps (DAU, revenue)
- ✓ **useNotifications.js** - Notificaciones del sistema
- ✓ **useFinanzas.js** - Datos para gráficos de finanzas (usa tabla metrics)
- ✓ **useGastos.js** - CRUD de gastos
- ✓ **useEventos.js** - CRUD de eventos del calendario
- ✓ **useIdeas.js** - CRUD de ideas con búsqueda
- ✓ **useTareas.js** - CRUD de tareas (estructura con bloques)
- ✓ **useAsoTracker.js** - Seguimiento de ASO (App Store Optimization)
- ✓ **useAgentInbox.js** - Recepción de items del inbox de agentes
- ✓ **usePipelineRuns.js** - Gestión de ejecuciones del pipeline
- ✓ **useVersionLog.js** - Historial de versiones (definido pero no usado en UI)
- ✓ **useResearch.js** - Investigación de competidores (definido pero no usado en UI)

#### 🧩 Componentes UI (`src/components/ui/` - 7 archivos)
- ✓ **MetricCard.jsx** - Card para mostrar métrica
- ✓ **StatusBadge.jsx** - Badge de estado (development, testing, published, deprecated)
- ✓ **AppIcon.jsx** - Ícono de app
- ✓ **ConfirmModal.jsx** - Modal de confirmación
- ✓ **ToastNotification.jsx** - Notificación tipo toast
- ✓ **DatePicker.jsx** - Selector de fecha (puede no estar siendo usado)
- ✓ **Otros** - Componentes inline en páginas

#### 🧩 Componentes de Layout (`src/components/layout/` - 3 archivos)
- ✓ **Sidebar.jsx** - Navegación principal con 10 items
- ✓ **TopBar.jsx** - Barra superior con título
- ✓ **AuthGuard.jsx** - Protección de rutas autenticadas

#### 🧩 Componentes de Dominio
- ✓ `src/components/apps/` - AppForm.jsx, KanbanBoard.jsx
- ✓ `src/components/finanzas/` - GastoForm.jsx
- ✓ `src/components/metrics/` - RevenueChart.jsx, DAUChart.jsx, MetricsTable.jsx, MetricsForm.jsx
- ✓ `src/components/tasks/` - (archivos mencionados en estructura pero sin componentes adicionales)
- ✓ `src/components/notifications/` - (estructura existente)

#### 🔧 Configuración
- ✓ **src/lib/supabase.js** - Cliente Supabase inicializado
- ✓ **src/App.jsx** - Router principal
- ✓ **src/main.jsx** - Entry point
- ✓ **src/index.css** - Estilos globales
- ✓ **src/App.css** - Estilos de App

---

## 2. INVENTARIO DE RUTAS

| Ruta | Componente | Estado | Notas |
|------|-----------|--------|-------|
| `/login` | Login | ✓ Funcional | Autenticación con Supabase |
| `/` | Home | ✓ Funcional | Dashboard con resumen de apps, tareas y métricas |
| `/apps` | Apps | ✓ Funcional | Listado de apps con búsqueda |
| `/apps/:id` | AppDetail | ✓ Funcional | Detalle de app con tabs |
| `/finanzas` | Finanzas | ✓ Funcional | Gráficos de revenue y gastos |
| `/notificaciones` | Notificaciones | ✓ Funcional | Centro de notificaciones |
| `/agentes` | Agentes | ⚠️ Parcial | Solo Legal está activo; otros agentes marcan "Próximamente" |
| `/calendario` | Calendario | ✓ Funcional | Calendario con eventos y objetivos |
| `/pipeline` | Pipeline | ✓ Funcional | Control del pipeline de generación de apps Android |
| `/reportes` | Reportes | ⚠️ Parcial | Recibe reportes pero tabla `agent_inbox` puede no existir |
| `/ideas` | Ideas | ✓ Funcional | Listado de ideas con búsqueda y filtros |
| `/ideas/:id` | IdeaDetail | ✓ Funcional | Detalle de idea con editor inline y checklist |
| `/tareas` | Tareas | ✓ Funcional | Tablero Kanban con bloques de tareas |

---

## 3. INVENTARIO DE TABLAS SUPABASE

| Tabla | Hooks que la usan | Páginas que la muestran | Estado |
|-------|------------------|------------------------|--------|
| `apps` | useApps | Home, Apps, AppDetail, Agentes | ✓ Activa |
| `tasks` | useTasks, useTasksForApp | Calendario (uso incompleto) | ⚠️ Parcial |
| `tareas` | useTareas | Tareas | ✓ Activa |
| `metrics` | useMetrics, useFinanzas | Home, Apps, Finanzas | ✓ Activa |
| `notifications` | useNotifications | Notificaciones | ✓ Activa |
| `gastos` | useGastos | Finanzas | ✓ Activa |
| `eventos` | useEventos | Calendario | ✓ Activa |
| `aso_tracker` | useAsoTracker | (sin usar en UI) | ❌ No expuesta |
| `agent_inbox` | useAgentInbox | Agentes, Reportes | ✓ Activa |
| `ideas` | useIdeas | Ideas, IdeaDetail | ✓ Activa |
| `pipeline_runs` | usePipelineRuns | Home, Pipeline, IdeaDetail | ✓ Activa |
| `bloques_tareas` | useTareas | Tareas | ✓ Activa |
| `calendar_objectives` | (directo en Calendario.jsx) | Calendario | ✓ Activa |
| `version_log` | useVersionLog | (sin usar en UI) | ❌ No expuesta |
| `research` | useResearch | (sin usar en UI) | ❌ No expuesta |

---

## 4. GAPS IDENTIFICADOS

### 🔴 Problemas Críticos

#### 4.1. Manuales/Documentación No Integrados
- **Descripción:** Los manuales viven en archivos .docx externos, no en el dashboard
- **Impacto:** No es una "central de operaciones" como se requiere
- **Ubicación:** No existe tabla ni página para Knowledge Base
- **Prioridad:** ALTA (es uno de los objetivos principales)

#### 4.2. Agentes No Construidos
- **Descripción:** 4 de 5 agentes están marcados como "Próximamente"
  - Agente de Investigación
  - Agente de Screenshots
  - Agente de Contenido TikTok/YouTube
  - Agente de Update
- **Solo activo:** Agente Legal (genera política de privacidad)
- **Ubicación:** Páginas/Agentes.jsx:18-49
- **Impacto:** Funcionalidad limitada para automatización

#### 4.3. ASO Tracker No Expuesto
- **Descripción:** Hook `useAsoTracker` existe pero no se usa en ninguna página
- **Ubicación:** src/hooks/useAsoTracker.js
- **Impacto:** Datos de ASO están siendo recopilados pero no visualizados
- **Nota:** Podría convertirse en una nueva sección/página

#### 4.4. Research Module No Expuesto
- **Descripción:** Hook `useResearch` existe pero no se renderiza en UI
- **Ubicación:** src/hooks/useResearch.js
- **Impacto:** Investigación de palabras clave y competidores no visible

#### 4.5. Version Log No Expuesto
- **Descripción:** Hook `useVersionLog` existe pero no se usa en ninguna página
- **Ubicación:** src/hooks/useVersionLog.js
- **Impacto:** Historial de versiones no es visible para el usuario

### ⚠️ Funcionalidades Parciales

#### 4.6. Tasks vs Tareas (Duplicación/Confusión)
- **Problema:** Existen dos sistemas de tareas
  - `tasks` y `useTasksForApp` (tablas tasks)
  - `tareas` y `useTareas` (tabla tareas con bloques_tareas)
- **Estado actual:** Solo Tareas está completamente implementado (Kanban)
- **Ubicación:** Calendario.jsx intenta usar tasks pero parcialmente
- **Recomendación:** Consolidar o aclarar diferencia

#### 4.7. Reportes Potencialmente Rotos
- **Descripción:** Reportes.jsx intenta acceder a tabla `agent_inbox` con tipo='reporte'
- **Línea:** Reportes.jsx:32-35
- **Problema:** Puede no existir si los agentes nunca depositaron reportes
- **Estado:** Maneja el error gracefully pero functionality may be incomplete

#### 4.8. Calendario con Funcionalidad Incompleta
- **Descripción:** Mezcla dos conceptos:
  - Tasks del sistema (tabla tasks)
  - Objetivos mensuales (tabla calendar_objectives)
- **Línea:** Calendario.jsx:104, 124, 191+
- **Estado:** Funciona pero confuso

### ❌ Archivos/Componentes Sin Usar

#### 4.9. DatePicker Componente Unused
- **Ubicación:** src/components/ui/DatePicker.jsx
- **Uso:** No se importa en ninguna página
- **Tamaño:** Potencial código muerto (a menos que se use en futuro)

#### 4.10. Components Sin Contenido
- `src/components/tasks/` - directorio existe pero vacío
- `src/components/notifications/` - directorio existe pero vacío

---

## 5. ANÁLISIS DE KNOWLEDGE BASE (Manuales/Documentación)

### Requisitos Iniciales
Necesidad: Integrar manuales/documentación en el dashboard en lugar de archivos .docx externos

### Análisis de Soluciones

#### Opción A: Nueva Tabla Supabase + Nueva Página
**Tabla Supabase:**
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT, -- manual, guía, checklist, documentación
  contenido TEXT, -- markdown o html
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  orden INTEGER -- para sorteo
);
```

**Ubicación en Sidebar:** Entre "Ideas" y "Reportes" o nuevo item "Manuales"

**Ventajas:**
- Integración nativa en Supabase
- Búsqueda y filtrado por categoría
- Versionable en BD
- Reutilizable para cualquier tipo de documento

**Desventajas:**
- Requiere nueva página React
- Requiere nuevo hook (useKnowledgeBase)

#### Opción B: Reutilizar Tabla Existente
Podría usar `agent_inbox` con tipo='manual' pero:
- No es semánticamente correcto
- Confunde el propósito del inbox

#### Opción C: Integración con IdeaDetail
Agregar sección de "Documentación" dentro de IdeaDetail, pero:
- No es escalable para manuales generales
- Las ideas son proyectos, no documentación

### Recomendación
**Opción A** es la mejor: crear tabla dedicada + página + hook

---

## 6. ANÁLISIS DE COMPONENTES REUTILIZABLES

Para la futura Knowledge Base, componentes que podrían reutilizarse:

1. **ConfirmModal** - Para confirmaciones de eliminación
2. **ToastNotification** - Para feedback de operaciones
3. **MetricCard** - Podría adaptarse para mostrar categorías
4. **StatusBadge** - Para marcar tipos de documentos
5. **Sidebar navigation pattern** - El layout ya existe

---

## 7. ESTADO ACTUAL DE LA INFRAESTRUCTURA

### ✓ Bien Implementado
- **Router de React:** Todas las rutas están correctamente protegidas con AuthGuard
- **Autenticación:** Sistema Supabase funcional con Login page
- **Componentes UI:** Base sólida de componentes reutilizables
- **Hooks:** Sistema de hooks bien organizado
- **Dark Mode:** Design system implementado (colores, tipografía)
- **Responsive:** Layout mobile-friendly con sidebar adaptable
- **Layout Principal:** Sidebar + TopBar + Main content área

### ⚠️ Podría Mejorarse
- **Manejo de errores:** Algunos componentes tienen try/catch básicos, otros no
- **Loading states:** Algunos componentes cargan datos pero no muestran loading UI clara
- **Real-time updates:** Algunos hooks usan polling en lugar de suscripciones Supabase
- **Testabilidad:** Sin tests unitarios o E2E

### ❌ Falta Implementar
- **Knowledge Base:** Central de documentación
- **Más agentes:** 4 de 5 agentes pendientes
- **Exportación de datos:** No hay opción para exportar reportes/datos
- **Historial/auditoría:** No hay log de cambios por página
- **Búsqueda global:** No hay buscador de omnichannel

---

## 8. PREGUNTAS PARA EL DUEÑO

### Sobre Knowledge Base
1. **¿Qué tipos de documentos necesitas?** (manuales de uso, checklists, guías técnicas, políticas, etc.)
2. **¿Quién escribe/editar estos documentos?** (Solo el dueño, colaboradores, importar desde external?)
3. **¿Necesita control de versiones** o simplemente historial de cambios?
4. **¿Qué campos son críticos?** (título, categoría, tags, descripción corta, contenido)
5. **¿Markdown o editor WYSIWYG?** (Recomendación: Markdown es más simple para una sola persona)

### Sobre Tablas y Datos
6. **¿La tabla `tasks` se sigue usando o fue completamente reemplazada por `tareas`?**
7. **¿Debe existir relación entre `ideas` y `tareas` específicas de esa idea?**
8. **¿Los datos en `aso_tracker` deben exponerse en una página propia o integrados en AppDetail?**

### Sobre Agentes
9. **¿Cuál es el orden de prioridad para los agentes pendientes?** (Legal está hecho, ¿cuál sigue?)
10. **¿Los agentes necesitan webhooks ya configurados (n8n) o son ideas futuras?**

### Sobre Experiencia General
11. **¿Hay algo que sea lento o frustrante en el dashboard actualmente?**
12. **¿Necesita colaboración (múltiples usuarios) o siempre será de una sola persona?**
13. **¿Hay flujos que requieren pasos repetitivos que podrían automatizarse?**

---

## 9. RESUMEN EJECUTIVO

### 📊 Métricas del Codebase
- **Total de páginas:** 13 (todas con ruta)
- **Total de hooks:** 16 (3 sin usar en UI: VersionLog, Research, AsoTracker)
- **Total de tablas Supabase:** 15 (todas en uso, algunas parciales)
- **Líneas de código estimadas:** ~6000+ (React)
- **Componentes reutilizables:** 7 en UI, muchos inline en páginas

### 🎯 Estado del Proyecto
**FUNCIONAL pero INCOMPLETO:**
- ✓ Infraestructura sólida (Router, Auth, Hooks, UI)
- ✓ Mayoría de funcionalidades core funcionan
- ✓ Design system consistente
- ⚠️ Gaps en documentación y automatización
- ❌ Knowledge Base no existe
- ❌ Agentes limitados

### 📈 Prioridades Recomendadas (Orden)
1. **Implementar Knowledge Base** (Objetivo principal del dueño)
2. **Consolidar Tasks/Tareas** (Limpiar duplicación o aclarar diferencia)
3. **Exponer ASO Tracker** (Datos ya existen, solo falta UI)
4. **Construir siguiente agente** (¿Investigación, Screenshots, o Contenido?)
5. **Mejorar carga y estados loading** (UX)

---

## 10. ARCHIVOS CLAVE A REVISAR

Para futuras modificaciones, estos son los archivos más importantes:

```
src/App.jsx                      - Router maestro
src/components/layout/Sidebar    - Navegación (agregar nuevas rutas aquí)
src/lib/supabase.js             - Cliente Supabase
src/hooks/useAuth.js            - Autenticación
src/pages/Home.jsx              - Dashboard
src/pages/IdeaDetail.jsx        - Modelo de editor inline (reutilizable)
src/components/ui/*             - Componentes reutilizables
```

---

**Auditoría completada:** 2026-05-06  
**Siguientes pasos:** Esperar feedback del dueño sobre las preguntas planteadas antes de proponer cambios.
