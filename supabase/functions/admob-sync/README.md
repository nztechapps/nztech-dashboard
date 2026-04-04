# AdMob Sync Edge Function

Edge Function para sincronizar métricas de AdMob directamente en Supabase.

## Qué hace

La función `admob-sync` se conecta a Google AdMob API y sincroniza las siguientes métricas diarias para cada app:
- Impresiones
- Clicks
- Ingresos estimados
- Requests de anuncios

Luego hace UPSERT en la tabla `metrics` con `fuente = 'admob'` para que los datos estén disponibles en el dashboard.

## Setup

### 1. Crear Service Account en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Service Accounts** (IAM > Service Accounts)
4. Haz click en **Create Service Account**
5. Completa los detalles y haz click **Create and Continue**
6. En **Grant this service account access to project**, asigna el rol:
   - **AdMob Viewer** (si no aparece, busca "AdMob" en los roles custom)
7. Haz click **Continue** y luego **Done**

### 2. Descargar credenciales

1. En la lista de Service Accounts, haz click en la que creaste
2. Ve a la pestaña **Keys**
3. Haz click en **Add Key** → **Create new key**
4. Elige **JSON** como formato
5. Se descargará un archivo JSON con las credenciales. Guárdalo seguro.

### 3. Configurar en Supabase

```bash
# Copiar todo el contenido del JSON descargado
cat /ruta/al/archivo/credenciales.json

# Configurar como secret en Supabase
supabase secrets set ADMOB_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","...":"..."}'
```

⚠️ **Importante**: Asegúrate de:
- Poner todo el JSON en una sola línea (sin saltos)
- Usar comillas simples para envolver el JSON completo
- Incluir el JSON completo sin omitir campos

### 4. Deploy

```bash
# Desde la raíz del proyecto
supabase functions deploy admob-sync
```

Output esperado:
```
✓ Function deployed successfully
  admob-sync: https://[PROJECT-ID].functions.supabase.co/admob-sync
```

### 5. Testing

```bash
# Invocar la función directamente
supabase functions invoke admob-sync

# O con curl (requiere auth)
curl -i --location --request POST 'https://[PROJECT-ID].functions.supabase.co/admob-sync' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json'
```

Ejemplo de respuesta exitosa:
```json
{
  "date": "2026-03-05",
  "appsProcessed": 2,
  "results": [
    {
      "app": "Mi App",
      "status": "success",
      "metrics": {
        "impressions": 1500,
        "clicks": 45,
        "estimatedEarnings": 12.50,
        "adRequests": 1600
      }
    }
  ]
}
```

## Configurar sync automático (opcional)

Para ejecutar la función diariamente, puedes:

### Opción A: Usar pg_cron (si está disponible en tu plan)

```sql
-- En la SQL editor de Supabase
select cron.schedule(
  'admob-sync-daily',
  '0 2 * * *',  -- 2 AM UTC cada día
  $$
  select
    net.http_post(
      url:='https://[PROJECT-ID].functions.supabase.co/admob-sync',
      headers:='{"Authorization": "Bearer [SERVICE_ROLE_KEY]"}',
      body:='{}'::jsonb
    ) as request_id;
  $$
);
```

### Opción B: Usar un scheduler externo (GitHub Actions, Vercel Cron, etc.)

```yaml
# .github/workflows/admob-sync.yml
name: AdMob Daily Sync

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger AdMob Sync
        run: |
          curl -X POST https://[PROJECT-ID].functions.supabase.co/admob-sync \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

## Estructura de datos

La función espera que:

1. **Tabla `apps`** tenga una columna `admob_unit_id` (VARCHAR, nullable)
2. **Tabla `metrics`** tenga las siguientes columnas:
   - `app_id` (UUID, FK to apps)
   - `fecha` (DATE)
   - `impresiones` (INTEGER)
   - `clicks` (INTEGER)
   - `ingresos` (NUMERIC)
   - `fuente` (VARCHAR) — valor: 'admob'
   - `created_at` (TIMESTAMP, auto)
   - PK compuesto: (app_id, fecha, fuente)

## Variables de entorno requeridas

- `ADMOB_SERVICE_ACCOUNT_JSON`: JSON con credenciales de Service Account
- `SUPABASE_URL`: Automático (se carga desde el proyecto)
- `SUPABASE_SERVICE_ROLE_KEY`: Automático (se carga desde el proyecto)

## Troubleshooting

### "ADMOB_SERVICE_ACCOUNT_JSON not configured"
- Verifica que hayas ejecutado `supabase secrets set` correctamente
- Confirma que el secret está en la región correcta

### "JWT creation failed"
- Verifica que el JSON contiene `private_key` y `client_email`
- El `private_key` debe incluir los caracteres `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`

### "AdMob API error: 403 Forbidden"
- El Service Account no tiene permisos en AdMob
- Verifica que le asignaste el rol de **Viewer** en AdMob

### "No data"
- Verifica que las apps tengan un `admob_unit_id` válido
- El `admob_unit_id` debe ser en formato: `ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy`
- Asegúrate de que hay datos disponibles en AdMob para esa fecha

## Límites

- AdMob API: 10 requests/segundo por cuenta
- Datos disponibles: últimos 1-2 días (AdMob API demora en procesar)
- Máximo 100 apps por sincronización (editable en el código)

## Costos

- **Supabase Edge Functions**: primeros 10M invocaciones/mes gratis
- **Google AdMob API**: Gratis (incluido en plan de AdMob)

## Referencias

- [AdMob API Docs](https://developers.google.com/admob/api/rest)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Google Service Accounts](https://cloud.google.com/docs/authentication/production)
