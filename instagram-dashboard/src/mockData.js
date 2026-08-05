// ============================================================
// Datos de ejemplo (MODO DEMO).
// Se usan cuando no hay IG_ACCESS_TOKEN / IG_USER_ID configurados,
// para que puedas ver el dashboard funcionando sin ningun setup.
// Los numeros son ficticios pero con formas realistas.
// ============================================================

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function series(days, base, variance, trend, seed) {
  const rnd = seededRandom(seed);
  const points = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayIndex = days - 1 - i;
    // fin de semana un poco mas bajo
    const weekend = [0, 6].includes(d.getDay()) ? 0.8 : 1;
    const value = Math.max(
      0,
      Math.round((base + trend * dayIndex + (rnd() - 0.5) * variance) * weekend)
    );
    points.push({ date: d.toISOString().slice(0, 10), value });
  }
  return points;
}

export const mockAccount = {
  username: "estudio.demo",
  name: "Cuenta Demo",
  profilePicture: null,
  biography: "MODO DEMO - Estos datos son de ejemplo, no reales.",
  followers: 3482,
  following: 412,
  mediaCount: 187,
};

export function mockTimeseries(metric, days = 30) {
  const config = {
    profile_views: { base: 120, variance: 60, trend: 1.2, seed: 11, title: "Visitas al perfil" },
    reach: { base: 2200, variance: 900, trend: 8, seed: 22, title: "Alcance" },
    impressions: { base: 3800, variance: 1400, trend: 12, seed: 33, title: "Impresiones" },
    follower_count: { base: 6, variance: 8, trend: 0.1, seed: 44, title: "Nuevos seguidores/dia" },
  }[metric] || { base: 100, variance: 40, trend: 0, seed: 99, title: metric };

  return {
    metric,
    title: config.title,
    points: series(days, config.base, config.variance, config.trend, config.seed),
    demo: true,
  };
}

export function mockDemographics(breakdown = "country") {
  const data = {
    country: [
      { label: "AR", value: 2140 },
      { label: "ES", value: 431 },
      { label: "MX", value: 288 },
      { label: "UY", value: 201 },
      { label: "CL", value: 154 },
      { label: "US", value: 128 },
    ],
    city: [
      { label: "Buenos Aires", value: 890 },
      { label: "Cordoba", value: 512 },
      { label: "Rosario", value: 388 },
      { label: "Madrid", value: 211 },
      { label: "Mendoza", value: 176 },
    ],
    age: [
      { label: "18-24", value: 620 },
      { label: "25-34", value: 1510 },
      { label: "35-44", value: 890 },
      { label: "45-54", value: 312 },
      { label: "55-64", value: 98 },
      { label: "65+", value: 52 },
    ],
    gender: [
      { label: "F", value: 1980 },
      { label: "M", value: 1420 },
      { label: "U", value: 82 },
    ],
  };
  return { breakdown, rows: data[breakdown] || [], demo: true };
}

export function mockMedia() {
  const rnd = seededRandom(7);
  const captions = [
    "Nuevo articulo en el blog del estudio",
    "Consultas laborales: lo que tenes que saber",
    "Equipo trabajando a full esta semana",
    "Preguntas frecuentes sobre alquileres",
    "Charla abierta el proximo viernes",
    "Novedades en derecho de familia",
    "Como iniciar un reclamo por danos",
    "Atencion: cambios en la normativa",
    "Testimonio de un cliente",
  ];
  const items = captions.map((c, i) => ({
    id: `demo_${i}`,
    caption: c,
    type: i % 3 === 0 ? "VIDEO" : "IMAGE",
    thumb: null,
    permalink: "#",
    timestamp: new Date(Date.now() - i * 3 * 86400000).toISOString(),
    likes: Math.round(80 + rnd() * 400),
    comments: Math.round(2 + rnd() * 40),
  }));
  return { items, demo: true };
}
