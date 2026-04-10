# Tabs Nuevos en IdeaDetail.jsx

Se agregaron 3 tabs nuevos al flujo de ideas: **Calidad**, **Publicación** y **Screenshots**.

## Tabs Finales
Info | Research | Specs | Pipeline | **Calidad** | **Publicación** | **Screenshots**

---

## 📋 TAB CALIDAD

**Visible:** Solo cuando hay un pipeline run completado para la idea.

**Checklist de 6 items:**
- ✓ El HTML carga sin errores en el emulador
- ✓ Los datos vienen de APIs reales (no mockeados)
- ✓ El diseño usa la paleta y tipografía correcta
- ✓ No hay errores de JavaScript en la consola
- ✓ Todas las tabs navegan correctamente
- ✓ Los errores de red muestran mensaje amigable

**Datos guardados en:** Supabase tabla `ideas`, columna `checklist_calidad` (jsonb)

**Acción:** Cuando los 6 items están en `true`, muestra botón verde "✓ Calidad aprobada — ir a Publicación" que navega al tab Publicación.

---

## 🚀 TAB PUBLICACIÓN

**Visible:** Solo cuando el control de calidad está aprobado (los 6 items de Calidad en true).

**Dos secciones de checklist:**

### Setup Técnico (5 items)
- ✓ google-services.json copiado a app/
- ✓ App ID de AdMob en AndroidManifest.xml
- ✓ Unit ID de banner en activity_main.xml
- ✓ Build release generado sin errores
- ✓ APK firmado con keystore

### Play Store (5 items)
- ✓ Screenshots subidos (mínimo 2)
- ✓ Descripción ASO cargada en Play Console
- ✓ URL de política de privacidad configurada
- ✓ Clasificación de contenido completada
- ✓ Cuestionario de seguridad de datos completado

**Datos guardados en:** Supabase tabla `ideas`, columna `checklist_publicacion` (jsonb)

**Progreso:** Barra visual con X/10 items completados.

**Acción final:** Cuando los 10 items están en `true`, muestra botón grande "🚀 Convertir en App" que:
1. ✅ Inserta en tabla `apps` con datos de la idea
2. ✅ Actualiza estado de idea a `'publicada'`
3. ✅ Navega a `/apps`

---

## 📸 TAB SCREENSHOTS

**Visible:** Cuando hay un pipeline run completado.

**Dos secciones:**

### 1. Feature Graphic Generator
Botón "✨ Generar Feature Graphic (Claude)" que:
- Llama Claude API (modelo: `claude-haiku-4-5-20251001`)
- Genera especificaciones de diseño para feature graphic 1024x500px
- Usa colores del research (`idea.research?.diseno?.paleta`)
- Devuelve JSON con: `background_color`, `text_color`, `headline`, `subheadline`, `layout_description`
- Muestra preview visual del diseño generado

**Datos guardados en:** Supabase tabla `ideas`, columna `feature_graphic_spec` (jsonb)

### 2. Screenshots (Placeholder)
Incluye placeholder para subir múltiples imágenes.
**Nota:** Requiere implementación de Supabase Storage o similar para almacenamiento de archivos.

---

## 🔧 Setup Requerido

### 1. Migración de Base de Datos
Ejecuta el archivo `migrations_idea_checklists.sql` en Supabase SQL Editor:

```sql
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS checklist_calidad jsonb DEFAULT '{}';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS checklist_publicacion jsonb DEFAULT '{}';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS screenshots jsonb DEFAULT '[]';
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS feature_graphic_spec jsonb DEFAULT NULL;
```

### 2. API Key de Anthropic
Agrega tu API key en `.env.local`:

```
VITE_ANTHROPIC_API_KEY=sk_your_key_here
```

Obtén la key en: https://console.anthropic.com/account/keys

### 3. Tabla `apps` (si no existe)
Asegúrate de que existe la tabla `apps` con al menos estas columnas:
- `id` (uuid)
- `nombre` (text)
- `descripcion` (text)
- `package_name` (text)
- `estado` (text)
- `idea_id` (uuid, FK a ideas.id)
- `repo_url` (text)
- `categoria` (text)
- `created_at` (timestamp)

---

## 📝 Lógica de Flujo

```
Info → Research → Specs → Pipeline
                            ↓ (completado)
                          Calidad (6 items)
                            ↓ (aprobada)
                       Publicación (10 items)
                            ↓ (completado)
                      "Convertir en App" → /apps
                      
Screenshots: disponible desde que hay pipeline completado
```

---

## 🎨 Estilos
- Tema oscuro NZTech (#0A0A0F fondo, #13131A superficies, #00E5A0 verde)
- Checkboxes con `accentColor: #00E5A0`
- Hover effects en items
- Barras de progreso animadas
- Transiciones smooth entre tabs

---

## 📌 Notas
- Los checklists se guardan automáticamente al tildar/desmarcar items
- El Feature Graphic Preview es CSS-based, no requiere librerías extras
- La navegación entre tabs mantiene los datos de los anteriores
- Los tabs deshabilitados aparecen en gris con cursor `not-allowed`
