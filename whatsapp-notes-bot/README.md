# Bot de Notas y Plazos para WhatsApp

Bot para tomar notas rápidas **y programar recordatorios de plazos** desde
WhatsApp. Le escribís al número vinculado: guarda, lista, busca y borra notas, y
te **avisa por WhatsApp** cuando llega un vencimiento que le cargaste. Todo se
guarda en un archivo JSON local.

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

### Notas

| Comando            | Qué hace                                  |
| ------------------ | ----------------------------------------- |
| `/nota <texto>`    | Guarda una nota                           |
| `/lista`           | Muestra todas tus notas                   |
| `/buscar <texto>`  | Busca en tus notas                        |
| `/borrar <id>`     | Borra una nota por su número              |
| `/limpiar`         | Borra todas tus notas                     |
| `/ayuda`           | Muestra la ayuda                          |

### Recordatorios / plazos ⏰

| Comando                    | Qué hace                                       |
| -------------------------- | ---------------------------------------------- |
| `/recordar <cuándo> <qué>` | Programa un aviso para esa fecha/hora          |
| `/plazos`                  | Lista tus recordatorios pendientes             |
| `/cancelar <id>`           | Cancela un recordatorio                        |

Cuando llega el momento, el bot te **manda un mensaje de WhatsApp** con el
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
> **corriendo** en ese momento (la terminal con `npm start` abierta, o el
> servidor prendido). Si un plazo vence mientras el bot estaba apagado, el aviso
> se manda apenas se vuelve a conectar. Las fechas usan el reloj y la zona
> horaria de la computadora donde corre el bot.

## Dónde se guardan las notas

En `data/notes.json`, agrupadas por contacto. Podés cambiar la carpeta con la
variable de entorno `NOTES_DATA_DIR`.

La carpeta `data/` está en `.gitignore` (incluye tus notas y la sesión de
WhatsApp) para que nada de eso se suba al repositorio.

## Migrar el almacenamiento

La lógica de guardado está aislada en `src/notes-store.js`. Para pasar a Google
Sheets o a una base de datos, se reemplaza esa clase manteniendo los mismos
métodos (notas: `add`, `list`, `search`, `remove`, `clear`; recordatorios:
`addReminder`, `listReminders`, `removeReminder`, `dueReminders`,
`markReminderSent`) sin tocar el resto del bot.
