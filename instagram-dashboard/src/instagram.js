// ============================================================
// Cliente de la Instagram Graph API (oficial de Meta).
//
// IMPORTANTE: La Graph API NO expone quien visita tu perfil.
// Ese dato no existe para nadie. Aca solo pedimos metricas
// que Meta si publica: alcance, visitas al perfil (agregado),
// seguidores, demografia de la audiencia y engagement.
//
// Meta cambia sus metricas con frecuencia. Cada llamada esta
// envuelta en try/catch y devuelve informacion parcial + notas
// cuando algo no esta disponible, en lugar de romper el dashboard.
// ============================================================

const VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const BASE = `https://graph.facebook.com/${VERSION}`;

export function isConfigured() {
  return Boolean(process.env.IG_ACCESS_TOKEN && process.env.IG_USER_ID);
}

function creds() {
  return {
    token: process.env.IG_ACCESS_TOKEN,
    userId: process.env.IG_USER_ID,
  };
}

// Wrapper generico de fetch contra la Graph API.
async function graphGet(path, params = {}) {
  const { token } = creds();
  const url = new URL(`${BASE}/${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }
  url.searchParams.set("access_token", token);

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data?.error?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.graphError = data?.error || null;
    throw err;
  }
  return data;
}

// --- Perfil basico de la cuenta -----------------------------
export async function getAccount() {
  const { userId } = creds();
  const fields =
    "username,name,profile_picture_url,biography,followers_count,follows_count,media_count";
  const data = await graphGet(userId, { fields });
  return {
    username: data.username,
    name: data.name,
    profilePicture: data.profile_picture_url || null,
    biography: data.biography || "",
    followers: data.followers_count ?? null,
    following: data.follows_count ?? null,
    mediaCount: data.media_count ?? null,
  };
}

// --- Serie temporal de una metrica diaria -------------------
// Pide metricas dia por dia (reach, profile_views, etc.).
// Devuelve { metric, points:[{date,value}], note? }
export async function getTimeseries(metric, days = 30) {
  const { userId } = creds();
  const now = Math.floor(Date.now() / 1000);
  const since = now - days * 24 * 60 * 60;

  // Metricas que en versiones recientes requieren metric_type=total_value.
  const totalValueMetrics = new Set(["profile_views", "reach", "accounts_engaged"]);

  const params = {
    metric,
    period: "day",
    since,
    until: now,
  };
  if (totalValueMetrics.has(metric)) params.metric_type = "total_value";

  try {
    const data = await graphGet(`${userId}/insights`, params);
    const entry = data?.data?.[0];

    // Formato clasico: values:[{value, end_time}]
    if (entry?.values?.length) {
      return {
        metric,
        title: entry.title || metric,
        points: entry.values.map((v) => ({
          date: (v.end_time || "").slice(0, 10),
          value: typeof v.value === "number" ? v.value : 0,
        })),
      };
    }

    // Formato total_value: un unico total para el rango.
    if (entry?.total_value) {
      return {
        metric,
        title: entry.title || metric,
        total: entry.total_value.value ?? 0,
        points: [],
        note: "Esta metrica devuelve un total del periodo, no una serie diaria.",
      };
    }

    return { metric, points: [], note: "Sin datos para esta metrica en el periodo." };
  } catch (err) {
    return {
      metric,
      points: [],
      error: err.message,
      note: "Metrica no disponible para esta cuenta o version de la API.",
    };
  }
}

// --- Demografia de la audiencia -----------------------------
// breakdown: country | city | age | gender
export async function getDemographics(breakdown = "country") {
  const { userId } = creds();
  try {
    const data = await graphGet(`${userId}/insights`, {
      metric: "follower_demographics",
      period: "lifetime",
      metric_type: "total_value",
      timeframe: "this_month",
      breakdown,
    });
    const results = data?.data?.[0]?.total_value?.breakdowns?.[0]?.results || [];
    const rows = results
      .map((r) => ({
        label: r.dimension_values?.[0] ?? "?",
        value: r.value ?? 0,
      }))
      .sort((a, b) => b.value - a.value);
    return { breakdown, rows };
  } catch (err) {
    return {
      breakdown,
      rows: [],
      error: err.message,
      note:
        "La demografia requiere +100 seguidores y una cuenta Business/Creator. Puede no estar disponible.",
    };
  }
}

// --- Publicaciones recientes + su engagement ----------------
export async function getRecentMedia(limit = 9) {
  const { userId } = creds();
  try {
    const fields =
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count";
    const data = await graphGet(`${userId}/media`, { fields, limit });
    const items = (data?.data || []).map((m) => ({
      id: m.id,
      caption: (m.caption || "").slice(0, 120),
      type: m.media_type,
      thumb: m.thumbnail_url || m.media_url || null,
      permalink: m.permalink,
      timestamp: m.timestamp,
      likes: m.like_count ?? 0,
      comments: m.comments_count ?? 0,
    }));
    return { items };
  } catch (err) {
    return { items: [], error: err.message };
  }
}
