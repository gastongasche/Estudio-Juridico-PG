// ============================================================
// Instagram Insights Dashboard - servidor
//
// Sirve el frontend y expone una API que hace de proxy a la
// Instagram Graph API. Si no hay credenciales configuradas,
// arranca en MODO DEMO con datos de ejemplo.
//
// Recordatorio honesto: NINGUN endpoint puede decirte quien
// visita/"stalkea" tu perfil. Instagram no publica ese dato.
// ============================================================

import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isConfigured,
  getAccount,
  getTimeseries,
  getDemographics,
  getRecentMedia,
} from "./src/instagram.js";
import {
  mockAccount,
  mockTimeseries,
  mockDemographics,
  mockMedia,
} from "./src/mockData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const DEMO = !isConfigured();

app.use(express.static(path.join(__dirname, "public")));

// Pequeno helper para no repetir el patron demo/real en cada ruta.
async function respond(res, realFn, mockFn) {
  try {
    const data = DEMO ? await mockFn() : await realFn();
    res.json(data);
  } catch (err) {
    res.status(502).json({
      error: err.message,
      hint: "Revisa tu IG_ACCESS_TOKEN / IG_USER_ID y los permisos de la app en Meta.",
    });
  }
}

// Estado: le dice al frontend si esta en demo o en real.
app.get("/api/status", (req, res) => {
  res.json({
    mode: DEMO ? "demo" : "live",
    graphVersion: process.env.GRAPH_API_VERSION || "v21.0",
    disclaimer:
      "Instagram no expone quien visita tu perfil. Este panel muestra metricas agregadas oficiales, nunca la identidad de 'visitantes'.",
  });
});

app.get("/api/overview", (req, res) =>
  respond(res, () => getAccount(), async () => mockAccount)
);

app.get("/api/timeseries", (req, res) => {
  const metric = String(req.query.metric || "profile_views");
  const days = Math.min(Math.max(parseInt(req.query.days) || 30, 1), 90);
  respond(
    res,
    () => getTimeseries(metric, days),
    async () => mockTimeseries(metric, days)
  );
});

app.get("/api/demographics", (req, res) => {
  const breakdown = String(req.query.breakdown || "country");
  respond(
    res,
    () => getDemographics(breakdown),
    async () => mockDemographics(breakdown)
  );
});

app.get("/api/media", (req, res) =>
  respond(res, () => getRecentMedia(9), async () => mockMedia())
);

app.listen(PORT, () => {
  console.log("\n  Instagram Insights Dashboard");
  console.log("  ----------------------------");
  console.log(`  Modo:      ${DEMO ? "DEMO (datos de ejemplo)" : "LIVE (Graph API)"}`);
  console.log(`  URL:       http://localhost:${PORT}`);
  if (DEMO) {
    console.log("\n  Para usar datos reales, copia .env.example a .env");
    console.log("  y carga IG_ACCESS_TOKEN e IG_USER_ID (ver README.md).\n");
  } else {
    console.log("");
  }
});
