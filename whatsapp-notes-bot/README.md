# Bot de Notas para WhatsApp

Bot simple para tomar notas rápidas desde WhatsApp. Le escribís al número
vinculado y guarda, lista, busca y borra tus notas. Las notas se guardan en un
archivo JSON local.

## Cómo funciona

- Usa [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js), que
  vincula **tu propio WhatsApp** vía un QR (como WhatsApp Web). No necesitás
  cuenta de Meta Business ni trámites.
- Al iniciar por primera vez, muestra un QR en la terminal. Lo escaneás desde
  WhatsApp en **Ajustes → Dispositivos vinculados → Vincular un dispositivo**.
- La sesión queda guardada en `data/session/`, así que no hay que escanear cada
  vez.

> Nota: es una biblioteca no oficial. Para uso personal el riesgo es bajo, pero
> técnicamente va contra los Términos de Servicio de WhatsApp. Si necesitás algo
> oficial y a gran escala, hay que migrar a la WhatsApp Business Cloud API.

## Requisitos

- Node.js 18 o superior.
- El equipo donde corra necesita las dependencias de Chromium (Puppeteer las
  descarga solo al instalar). En Linux quizás haga falta instalar librerías del
  sistema (`libnss3`, `libatk1.0-0`, etc.).

## Instalación

```bash
cd whatsapp-notes-bot
npm install
```

## Uso

```bash
npm start
```

La primera vez escaneá el QR que aparece en la terminal. Cuando veas
`✅ Bot de notas listo`, mandale un mensaje al número vinculado.

## Comandos

| Comando            | Qué hace                                  |
| ------------------ | ----------------------------------------- |
| `/nota <texto>`    | Guarda una nota                           |
| `/lista`           | Muestra todas tus notas                   |
| `/buscar <texto>`  | Busca en tus notas                        |
| `/borrar <id>`     | Borra una nota por su número              |
| `/limpiar`         | Borra todas tus notas                     |
| `/ayuda`           | Muestra la ayuda                          |

Además, **cualquier mensaje sin comando se guarda como nota automáticamente**.

## Dónde se guardan las notas

En `data/notes.json`, agrupadas por contacto. Podés cambiar la carpeta con la
variable de entorno `NOTES_DATA_DIR`.

La carpeta `data/` está en `.gitignore` (incluye tus notas y la sesión de
WhatsApp) para que nada de eso se suba al repositorio.

## Migrar el almacenamiento

La lógica de guardado está aislada en `src/notes-store.js`. Para pasar a Google
Sheets o a una base de datos, se reemplaza esa clase manteniendo los mismos
métodos (`add`, `list`, `search`, `remove`, `clear`) sin tocar el resto del bot.
