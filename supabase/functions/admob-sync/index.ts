import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as base64 from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

interface AdMobMetrics {
  impressions?: number;
  clicks?: number;
  estimatedEarnings?: {
    currencyCode: string;
    nanos: number;
  };
  adRequests?: number;
}

interface MetricRow {
  impressions: number;
  clicks: number;
  ingresos: number;
  fuente: string;
  app_id: string;
  fecha: string;
}

async function generateJWT(serviceAccount: ServiceAccountKey): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/admob.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerEncoded = base64.encodeUrl(encoder.encode(JSON.stringify(header)))
    .replace(/=/g, "");
  const payloadEncoded = base64.encodeUrl(encoder.encode(JSON.stringify(payload)))
    .replace(/=/g, "");

  const toSign = `${headerEncoded}.${payloadEncoded}`;

  // Para firmar, necesitaríamos crypto.subtle, que Deno soporta
  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    encoder.encode(toSign)
  );

  const signatureEncoded = base64.encodeUrl(new Uint8Array(signature))
    .replace(/=/g, "");

  return `${toSign}.${signatureEncoded}`;
}

async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  const binaryString = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");

  const binaryData = base64.decode(binaryString);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryData,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  return key;
}

async function getAccessToken(serviceAccount: ServiceAccountKey): Promise<string> {
  const jwt = await generateJWT(serviceAccount);

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function getAdMobMetrics(
  accessToken: string,
  accountId: string,
  unitId: string,
  date: string
): Promise<AdMobMetrics | null> {
  try {
    const response = await fetch(
      `https://admob.googleapis.com/v1/accounts/${accountId}/reports/generate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_spec: {
            date_range: {
              start_date: { year: parseInt(date.split("-")[0]), month: parseInt(date.split("-")[1]), day: parseInt(date.split("-")[2]) },
              end_date: { year: parseInt(date.split("-")[0]), month: parseInt(date.split("-")[1]), day: parseInt(date.split("-")[2]) },
            },
            dimensions: ["DATE"],
            metrics: ["IMPRESSIONS", "CLICKS", "ESTIMATED_EARNINGS", "AD_REQUESTS"],
            dimension_filters: [
              {
                dimension: "AD_UNIT",
                match_type: "EXACT",
                values: [unitId],
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("AdMob API error:", await response.text());
      return null;
    }

    const data = await response.json();
    if (data.rows && data.rows.length > 0) {
      const row = data.rows[0];
      return {
        impressions: parseInt(row.metric_values[0]?.integer_value || "0"),
        clicks: parseInt(row.metric_values[1]?.integer_value || "0"),
        estimatedEarnings: row.metric_values[2]?.decimal_value || { nanos: 0 },
        adRequests: parseInt(row.metric_values[3]?.integer_value || "0"),
      };
    }

    return null;
  } catch (err) {
    console.error("Error fetching AdMob metrics:", err);
    return null;
  }
}

async function syncAdMobMetrics() {
  const serviceAccountJson = Deno.env.get("ADMOB_SERVICE_ACCOUNT_JSON");
  if (!serviceAccountJson) {
    throw new Error("ADMOB_SERVICE_ACCOUNT_JSON not configured");
  }

  const serviceAccount: ServiceAccountKey = JSON.parse(serviceAccountJson);
  const accessToken = await getAccessToken(serviceAccount);
  const accountId = serviceAccount.project_id; // Supabase account ID (basado en project_id o custom)

  // Inicializar cliente de Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Obtener apps con admob_unit_id
  const { data: apps, error: appsError } = await supabase
    .from("apps")
    .select("id, nombre, admob_unit_id")
    .not("admob_unit_id", "is", null);

  if (appsError) {
    throw new Error(`Error fetching apps: ${appsError.message}`);
  }

  // Fecha de ayer
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  const syncResults = [];

  for (const app of apps || []) {
    try {
      const metrics = await getAdMobMetrics(
        accessToken,
        accountId,
        app.admob_unit_id,
        dateStr
      );

      if (metrics) {
        // Convertir ESTIMATED_EARNINGS (puede ser decimal o nanos)
        let ingreso = 0;
        if (typeof metrics.estimatedEarnings === "number") {
          ingreso = metrics.estimatedEarnings;
        } else if (metrics.estimatedEarnings && typeof metrics.estimatedEarnings === "object") {
          ingreso = (metrics.estimatedEarnings.nanos || 0) / 1_000_000_000;
        }

        const metricData: MetricRow = {
          impressions: metrics.impressions || 0,
          clicks: metrics.clicks || 0,
          ingresos: ingreso,
          fuente: "admob",
          app_id: app.id,
          fecha: dateStr,
        };

        // UPSERT
        const { error: upsertError } = await supabase
          .from("metrics")
          .upsert(metricData, {
            onConflict: "app_id,fecha,fuente",
          });

        if (upsertError) {
          syncResults.push({
            app: app.nombre,
            status: "error",
            message: upsertError.message,
          });
        } else {
          syncResults.push({
            app: app.nombre,
            status: "success",
            metrics,
          });
        }
      } else {
        syncResults.push({
          app: app.nombre,
          status: "no_data",
        });
      }
    } catch (err) {
      syncResults.push({
        app: app.nombre,
        status: "error",
        message: (err as Error).message,
      });
    }
  }

  return {
    date: dateStr,
    appsProcessed: syncResults.length,
    results: syncResults,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const result = await syncAdMobMetrics();
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
