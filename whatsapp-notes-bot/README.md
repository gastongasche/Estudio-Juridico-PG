# Bot de Notas y Plazos (Telegram)

Bot de **Telegram** para tomar notas rápidas **y programar recordatorios de
plazos**. Le escribís por Telegram: guarda, lista, busca y borra notas, y te
**avisa por Telegram** cuando llega un vencimiento que le cargaste. Todo se
guarda en un archivo JSON local.

> ¿Por qué Telegram y no WhatsApp? Telegram tiene una **API de bots oficial y
> gratuita**: no hace falta escanear QR, no usa un navegador de fondo y es tan
> liviano que se puede dejar corriendo gratis en la nube. (El bot de WhatsApp
> sigue disponible en `src/index.js` — ver el final.)

## Puesta en marcha (una sola vez)

### 1. Creá tu bot con @BotFather

1. En Telegram, buscá **@BotFather** y abrí el chat.
2. Enviá `/newbot` y seguí los pasos (nombre y un usuario que termine en `bot`).
3. BotFather te da un **token** parecido a `123456789:ABCdef...`. Guardalo.

### 2. Instalá y ejecutá

```bash
cd whatsapp-notes-bot
npm install
TELEGRAM_BOT_TOKEN=123456789:ABCdef... npm start
```

Cuando veas `✅ Bot de notas y plazos (Telegram) en marcha`, abrí el chat con
**tu bot** en Telegram y enviá `/start`.

## Comandos

### Notas

| Comando            | Qué hace                     |
| ------------------ | ---------------------------- |
| `/nota <texto>`    | Guarda una nota              |
| `/lista`           | Muestra todas tus notas      |
| `/buscar <texto>`  | Busca en tus notas           |
| `/borrar <id>`     | Borra una nota por su número |
| `/limpiar`         | Borra todas tus notas        |
| `/ayuda`           | Muestra la ayuda             |

### Recordatorios / plazos ⏰

| Comando                    | Qué hace                              |
| -------------------------- | ------------------------------------- |
| `/recordar <cuándo> <qué>` | Programa un aviso para esa fecha/hora |
| `/plazos`                  | Lista tus recordatorios pendientes    |
| `/cancelar <id>`           | Cancela un recordatorio               |

Cuando llega el momento, el bot te **manda un mensaje de Telegram** con el
recordatorio. Formatos de fecha que entiende:

- `/recordar 15/09 09:00 Contestar demanda` (día/mes y hora)
- `/recordar 15/09/2026 Vencimiento apelación` (con año; hora por defecto 09:00)
- `/recordar mañana Llamar al juzgado`
- `/recordar hoy 18:00 Cerrar escrito`
- `/recordar en 3 dias Presentar prueba`
- `/recordar en 2 horas Revisar escrito`
- `/recordar en 30 min Estirar`

Además, **cualquier mensaje sin comando se guarda como nota automáticamente**.

> **Importante:** para que los avisos lleguen, el bot tiene que estar
> **corriendo** en ese momento. Si un plazo vence mientras estaba apagado, el
> aviso se manda apenas vuelve a conectarse. Las fechas usan el reloj y la zona
> horaria de la computadora/servidor donde corre el bot.

## Solo para vos (opcional pero recomendado)

Como el bot es público en Telegram, cualquiera que lo encuentre podría
escribirle. Para que **solo responda a tu cuenta**, definí tu chat ID:

1. Escribile a **@userinfobot** en Telegram → te dice tu ID (un número).
2. Arrancá el bot con esa variable:

```bash
TELEGRAM_BOT_TOKEN=... TELEGRAM_ALLOWED_CHAT_ID=TU_ID npm start
```

Podés poner varios IDs separados por coma.

## Dejarlo corriendo gratis en la nube (24/7)

Para que los recordatorios suenen aunque tu compu esté apagada, subilo a un
servicio gratuito. La idea general (ejemplo con [Railway](https://railway.app) o
[Render](https://render.com)):

1. Subí este repo a GitHub (ya está).
2. Creá un proyecto nuevo apuntando a este repo, carpeta `whatsapp-notes-bot`.
3. Comando de inicio: `npm start`.
4. En **Variables**, agregá `TELEGRAM_BOT_TOKEN` (y opcional
   `TELEGRAM_ALLOWED_CHAT_ID`).
5. Deploy. Listo: el bot queda escuchando siempre.

> Ojo: algunos planes gratuitos "duermen" el servicio tras un rato de
> inactividad, lo que puede atrasar un recordatorio. Para plazos legales críticos
> conviene un plan que no duerma (suelen costar unos pocos dólares al mes).

## Dónde se guardan las notas

En `data/notes.json`. Podés cambiar la carpeta con la variable de entorno
`NOTES_DATA_DIR`. La carpeta `data/` está en `.gitignore` para no subir tus
notas al repositorio.

## Migrar el almacenamiento

La lógica de guardado está aislada en `src/notes-store.js`. Para pasar a Google
Sheets o a una base de datos, se reemplaza esa clase manteniendo los mismos
métodos (notas: `add`, `list`, `search`, `remove`, `clear`; recordatorios:
`addReminder`, `listReminders`, `removeReminder`, `dueReminders`,
`markReminderSent`) sin tocar el resto del bot.

## Estructura

| Archivo               | Rol                                                    |
| --------------------- | ----------------------------------------------------- |
| `src/telegram.js`     | Bot de Telegram (entrada principal, `npm start`)      |
| `src/index.js`        | Bot de WhatsApp alternativo (`npm run start:whatsapp`)|
| `src/commands.js`     | Interpreta los comandos y arma las respuestas         |
| `src/parse-date.js`   | Entiende las fechas en español/formato argentino      |
| `src/notes-store.js`  | Guardado de notas y recordatorios en JSON             |

## Alternativa: WhatsApp

El bot de WhatsApp (vía `whatsapp-web.js`, con QR) sigue disponible:

```bash
npm run start:whatsapp
```

Necesita un navegador Chromium de fondo y una computadora prendida; por eso
recomendamos la versión de Telegram.
