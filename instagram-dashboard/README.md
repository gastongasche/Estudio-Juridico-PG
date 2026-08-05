# Instagram Insights Dashboard 📊

Panel web para ver **métricas reales de tu cuenta de Instagram** usando la
**Graph API oficial de Meta**. Incluye un **modo demo** para probarlo sin
configurar nada.

---

## ⚠️ Lo primero: la verdad sobre los "stalkers"

Esta app **NO puede decirte quién visita o "stalkea" tu perfil**. Nadie puede:
Instagram **no publica ese dato** por ninguna vía (ni la app, ni la API, ni
ningún truco). Cualquier app que prometa "ver quién visitó tu perfil" es una
**estafa**, roba tu contraseña o te hace violar los términos y **te banean la
cuenta**.

Lo que este panel **sí** muestra (datos oficiales y agregados):

| Métrica | Qué es |
|--------|--------|
| **Visitas al perfil** | Cuántas veces vieron tu perfil (número, sin nombres) |
| **Alcance** | Cuentas únicas que vieron tu contenido |
| **Impresiones** | Veces totales que se mostró tu contenido |
| **Nuevos seguidores** | Evolución de seguidores en el tiempo |
| **Audiencia** | Demografía: país, ciudad, edad, género (agregado) |
| **Publicaciones** | Likes y comentarios de tus posts recientes |

---

## 🚀 Uso rápido (modo demo)

No necesitás token para probarlo:

```bash
cd instagram-dashboard
npm install
npm start
```

Abrí **http://localhost:3000**. Vas a ver el panel con **datos de ejemplo**
(badge naranja "MODO DEMO").

---

## 🔑 Usar tus datos reales

Para conectar tu cuenta necesitás cumplir **estos requisitos**:

1. Una cuenta de Instagram **Business** o **Creator** (gratis, se cambia
   desde la app de Instagram: *Configuración → Tipo de cuenta*).
2. Esa cuenta **vinculada a una página de Facebook**.
3. Una app en **Meta for Developers**.

### Paso a paso para obtener el token y el ID

1. Entrá a **https://developers.facebook.com/** → *Mis Apps* → **Crear app**
   → tipo **"Business"**.
2. Agregá el producto **"Instagram Graph API"** (o *Instagram* → *API con
   inicio de sesión de Facebook*).
3. Abrí el **Explorador de la API Graph**
   (https://developers.facebook.com/tools/explorer/).
4. Seleccioná tu app y otorgá estos permisos:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
5. Generá el token. Es de **corta duración** (1 hora).
6. **Conseguí tu IG_USER_ID**: en el Explorador hacé una consulta:
   ```
   GET  me/accounts
   ```
   Copiá el `id` de tu página. Luego:
   ```
   GET  {page-id}?fields=instagram_business_account
   ```
   El `instagram_business_account.id` que devuelve es tu **IG_USER_ID**.
7. **Convertí el token a larga duración** (60 días). En una terminal:
   ```bash
   curl "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=TU_APP_ID&client_secret=TU_APP_SECRET&fb_exchange_token=TU_TOKEN_CORTO"
   ```
   Usá el `access_token` que devuelve.

> 💡 El token largo dura ~60 días. Cuando expire, repetí el paso 7 (o
> automatizá la renovación). Meta cambia estos flujos seguido: si algo no
> coincide, revisá la doc oficial de *Instagram Graph API*.

### Configurar la app

```bash
cp .env.example .env
```

Editá `.env` y completá:

```
IG_ACCESS_TOKEN=tu_token_largo
IG_USER_ID=tu_ig_user_id
```

Reiniciá:

```bash
npm start
```

El badge ahora dirá **"EN VIVO"** (verde) y verás tus datos reales.

---

## 🧱 Estructura

```
instagram-dashboard/
├── server.js            # Servidor Express + rutas de la API
├── src/
│   ├── instagram.js     # Cliente de la Graph API (real)
│   └── mockData.js      # Datos de ejemplo (modo demo)
├── public/
│   ├── index.html       # Estructura del panel
│   ├── styles.css       # Estilos (tema claro/oscuro automático)
│   └── app.js           # Lógica + gráficos SVG (sin dependencias)
├── .env.example         # Plantilla de configuración
└── package.json
```

---

## ❓ Preguntas frecuentes

**¿Por qué algunas métricas aparecen vacías?**
Meta deprecia y renombra métricas seguido, y algunas dependen del tamaño de tu
cuenta (p. ej., la demografía requiere **+100 seguidores**). El panel degrada
con elegancia y te muestra una nota cuando una métrica no está disponible.

**¿Es seguro? ¿Le doy mi contraseña?**
Nunca. Esta app **no pide tu contraseña de Instagram**. Usa el sistema oficial
de tokens de Meta. Tu `.env` queda solo en tu máquina (está en `.gitignore`).

**¿Puedo saber quién dejó de seguirme?**
La Graph API no lista followers individuales para comparar. Para eso hace falta
otro enfoque (comparar snapshots de tu lista de seguidores exportada). Si te
sirve, se puede agregar como módulo aparte.
