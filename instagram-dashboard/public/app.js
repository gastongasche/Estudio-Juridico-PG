// ============================================================
// Frontend del dashboard. Vanilla JS, sin dependencias.
// Los graficos se dibujan a mano con SVG (nada de CDNs).
// ============================================================

const $ = (sel) => document.querySelector(sel);
const fmt = (n) =>
  n == null ? "—" : new Intl.NumberFormat("es-AR").format(Math.round(n));

const METRICS = [
  { key: "profile_views", label: "Visitas al perfil", color: "#d6317a" },
  { key: "reach", label: "Alcance", color: "#7a3ff7" },
  { key: "impressions", label: "Impresiones", color: "#f7a23b" },
  { key: "follower_count", label: "Nuevos seguidores", color: "#35c26a" },
];

const DEMO_BREAKDOWNS = [
  { key: "country", label: "País" },
  { key: "city", label: "Ciudad" },
  { key: "age", label: "Edad" },
  { key: "gender", label: "Género" },
];

const state = { days: 30, metric: "profile_views", breakdown: "country" };

async function getJSON(url) {
  const res = await fetch(url);
  return res.json();
}

// ---------- Init ----------
async function init() {
  // aviso cerrable
  $("#notice-close").addEventListener("click", () => ($("#notice").style.display = "none"));

  // rango
  $("#range").addEventListener("change", (e) => {
    state.days = parseInt(e.target.value);
    loadChart();
    loadKPIs();
  });

  buildMetricTabs();
  buildDemoTabs();

  const status = await getJSON("/api/status");
  const badge = $("#mode-badge");
  if (status.mode === "live") {
    badge.textContent = "● EN VIVO";
    badge.className = "badge badge-live";
  } else {
    badge.textContent = "● MODO DEMO";
    badge.className = "badge badge-demo";
  }

  loadProfile();
  loadKPIs();
  loadChart();
  loadDemographics();
  loadMedia();
}

// ---------- Tabs ----------
function buildMetricTabs() {
  const wrap = $("#metric-tabs");
  wrap.innerHTML = "";
  METRICS.forEach((m) => {
    const b = document.createElement("button");
    b.className = "tab" + (m.key === state.metric ? " active" : "");
    b.textContent = m.label;
    b.onclick = () => {
      state.metric = m.key;
      buildMetricTabs();
      loadChart();
    };
    wrap.appendChild(b);
  });
}

function buildDemoTabs() {
  const wrap = $("#demo-tabs");
  wrap.innerHTML = "";
  DEMO_BREAKDOWNS.forEach((d) => {
    const b = document.createElement("button");
    b.className = "tab" + (d.key === state.breakdown ? " active" : "");
    b.textContent = d.label;
    b.onclick = () => {
      state.breakdown = d.key;
      buildDemoTabs();
      loadDemographics();
    };
    wrap.appendChild(b);
  });
}

// ---------- Profile ----------
async function loadProfile() {
  const a = await getJSON("/api/overview");
  if (a.error) return;
  $("#p-name").textContent = a.name || a.username || "—";
  $("#p-handle").textContent = "@" + (a.username || "—");
  $("#p-bio").textContent = a.biography || "";
  $("#s-followers").textContent = fmt(a.followers);
  $("#s-following").textContent = fmt(a.following);
  $("#s-media").textContent = fmt(a.mediaCount);
  if (a.profilePicture) {
    $("#avatar").style.backgroundImage = `url("${a.profilePicture}")`;
  }
}

// ---------- KPIs ----------
async function loadKPIs() {
  const grid = $("#kpi-grid");
  grid.innerHTML = METRICS.map(
    (m) => `<div class="kpi" data-k="${m.key}">
      <div class="kpi-label"><span class="kpi-dot" style="background:${m.color}"></span>${m.label}</div>
      <div class="kpi-value">…</div>
      <div class="kpi-delta">—</div>
    </div>`
  ).join("");

  for (const m of METRICS) {
    const data = await getJSON(`/api/timeseries?metric=${m.key}&days=${state.days}`);
    const card = grid.querySelector(`[data-k="${m.key}"]`);
    if (!card) continue;
    const pts = data.points || [];
    const total = data.total ?? pts.reduce((s, p) => s + p.value, 0);
    card.querySelector(".kpi-value").textContent = fmt(total);

    // delta: comparar primera mitad vs segunda mitad del periodo
    const deltaEl = card.querySelector(".kpi-delta");
    if (pts.length >= 4) {
      const mid = Math.floor(pts.length / 2);
      const a = pts.slice(0, mid).reduce((s, p) => s + p.value, 0);
      const b = pts.slice(mid).reduce((s, p) => s + p.value, 0);
      if (a > 0) {
        const pct = Math.round(((b - a) / a) * 100);
        deltaEl.textContent = `${pct >= 0 ? "▲" : "▼"} ${Math.abs(pct)}% vs. periodo previo`;
        deltaEl.className = "kpi-delta " + (pct >= 0 ? "up" : "down");
      } else {
        deltaEl.textContent = "";
      }
    } else if (data.note) {
      deltaEl.textContent = data.note.slice(0, 40);
    } else {
      deltaEl.textContent = "";
    }
  }
}

// ---------- Main chart (area/line) ----------
async function loadChart() {
  const el = $("#main-chart");
  el.innerHTML = `<div class="loading">Cargando…</div>`;
  const data = await getJSON(`/api/timeseries?metric=${state.metric}&days=${state.days}`);
  const note = $("#chart-note");
  note.textContent = data.note || data.error || "";

  const pts = data.points || [];
  if (!pts.length) {
    el.innerHTML = `<div class="loading">Sin datos para mostrar en este periodo.</div>`;
    return;
  }
  const color = METRICS.find((m) => m.key === state.metric)?.color || "#d6317a";
  el.innerHTML = lineChart(pts, color);
}

function lineChart(points, color) {
  const W = 900,
    H = 280,
    pad = { t: 20, r: 16, b: 34, l: 48 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = 0;
  const n = points.length;

  const x = (i) => pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${(pad.t + ih).toFixed(1)} L${x(0).toFixed(1)},${(pad.t + ih).toFixed(1)} Z`;

  // gridlines + labels y
  const ticks = 4;
  let grid = "";
  for (let i = 0; i <= ticks; i++) {
    const val = (max / ticks) * i;
    const yy = y(val);
    grid += `<line x1="${pad.l}" y1="${yy}" x2="${W - pad.r}" y2="${yy}" class="grid"/>`;
    grid += `<text x="${pad.l - 8}" y="${yy + 4}" class="ax ax-y">${fmt(val)}</text>`;
  }

  // etiquetas x (algunas)
  const labelEvery = Math.ceil(n / 6);
  let xlabels = "";
  points.forEach((p, i) => {
    if (i % labelEvery === 0 || i === n - 1) {
      const d = p.date?.slice(5) || "";
      xlabels += `<text x="${x(i)}" y="${H - 10}" class="ax ax-x">${d}</text>`;
    }
  });

  // puntos
  const dots = points
    .map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="2.5" fill="${color}"><title>${p.date}: ${fmt(p.value)}</title></circle>`)
    .join("");

  const gid = "g" + Math.random().toString(36).slice(2, 7);
  return `<svg viewBox="0 0 ${W} ${H}" role="img">
    <defs>
      <linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <style>
      .grid{stroke:var(--line);stroke-width:1}
      .ax{fill:var(--text-faint);font-size:11px;font-family:inherit}
      .ax-y{text-anchor:end}
      .ax-x{text-anchor:middle}
    </style>
    ${grid}
    <path d="${area}" fill="url(#${gid})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xlabels}
  </svg>`;
}

// ---------- Demographics (horizontal bars) ----------
async function loadDemographics() {
  const el = $("#demo-chart");
  el.innerHTML = `<div class="loading">Cargando…</div>`;
  const data = await getJSON(`/api/demographics?breakdown=${state.breakdown}`);
  $("#demo-note").textContent = data.note || data.error || "";
  const rows = (data.rows || []).slice(0, 8);
  if (!rows.length) {
    el.innerHTML = `<div class="loading">Sin datos de audiencia disponibles.</div>`;
    return;
  }
  el.innerHTML = barChart(rows);
}

function barChart(rows) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  const colors = ["#d6317a", "#e0526f", "#f7a23b", "#7a3ff7", "#35c26a", "#3aa0e0", "#c94fd6", "#e0b53a"];
  return (
    `<div style="display:flex;flex-direction:column;gap:9px">` +
    rows
      .map((r, i) => {
        const pct = Math.max(2, (r.value / max) * 100);
        const c = colors[i % colors.length];
        return `<div style="display:flex;align-items:center;gap:10px">
          <div style="width:96px;font-size:12.5px;color:var(--text-dim);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${r.label}">${r.label}</div>
          <div style="flex:1;background:var(--bg-elev-2);border-radius:6px;height:20px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${c};border-radius:6px"></div>
          </div>
          <div style="width:56px;font-size:12.5px;text-align:right;font-variant-numeric:tabular-nums">${fmt(r.value)}</div>
        </div>`;
      })
      .join("") +
    `</div>`
  );
}

// ---------- Media ----------
async function loadMedia() {
  const el = $("#media-list");
  el.innerHTML = `<div class="loading">Cargando…</div>`;
  const data = await getJSON("/api/media");
  const items = data.items || [];
  if (!items.length) {
    el.innerHTML = `<div class="loading">${data.error || "Sin publicaciones."}</div>`;
    return;
  }
  el.innerHTML = items
    .map((m) => {
      const icon = m.type === "VIDEO" ? "🎬" : m.type === "CAROUSEL_ALBUM" ? "🖼️" : "📷";
      const thumb = m.thumb
        ? `style="background-image:url('${m.thumb}')"`
        : "";
      const date = m.timestamp ? new Date(m.timestamp).toLocaleDateString("es-AR") : "";
      return `<a class="media-item" href="${m.permalink}" target="_blank" rel="noopener">
        <div class="media-thumb" ${thumb}>${m.thumb ? "" : icon}</div>
        <div class="media-body">
          <div class="media-cap">${escapeHtml(m.caption) || "(sin texto)"}</div>
          <div class="media-meta">❤ ${fmt(m.likes)} · 💬 ${fmt(m.comments)} · ${date}</div>
        </div>
      </a>`;
    })
    .join("");
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

init();
