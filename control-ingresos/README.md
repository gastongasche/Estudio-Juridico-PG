# Control de Ingresos 📈

Aplicación **personal** para registrar ingresos y ver resúmenes y totales.
Es una **PWA (Progressive Web App)**: se instala directamente en el celular
desde el navegador, sin pasar por App Store ni Google Play. Funciona offline
y guarda los datos en el propio teléfono.

> App independiente. No tiene relación con las aplicaciones del estudio.

## Funciones

- ✍️ Cargar ingresos: monto, concepto, categoría y fecha.
- 📅 Navegación por mes con el total del mes destacado.
- 📊 Resumen: total del año, promedio mensual, mejor mes, gráfico de los
  últimos 6 meses y desglose por categoría.
- 🌙 Tema claro / oscuro.
- 💾 Todos los datos quedan guardados **solo en tu celular** (localStorage).

## Cómo instalarla en el celular

La app necesita servirse por **HTTPS** (o `localhost`). La forma más simple es
publicarla con GitHub Pages y abrir la URL desde el celular.

### Android (Chrome)
1. Abrí la URL de la app en Chrome.
2. Menú (⋮) → **Instalar aplicación** / **Agregar a pantalla principal**.
   (También puede aparecer el cartel "Instalá la app" dentro de la propia app.)

### iPhone / iPad (Safari)
1. Abrí la URL de la app en **Safari**.
2. Botón **Compartir** (cuadrado con flecha ↑) → **Agregar a inicio**.

Listo: queda un ícono en la pantalla de inicio y se abre a pantalla completa
como cualquier app.

## Probarla localmente

Desde esta carpeta:

```bash
python3 -m http.server 8080
```

Luego abrir `http://localhost:8080` en el navegador.

## Archivos

- `index.html` — la app completa (interfaz + lógica).
- `manifest.webmanifest` — datos de la PWA (nombre, íconos, colores).
- `sw.js` — service worker (funcionamiento offline).
- `icons/` — íconos de la app.
