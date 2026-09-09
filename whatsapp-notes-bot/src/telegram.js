'use strict';

const path = require('path');
const TelegramBot = require('node-telegram-bot-api');

const { NotesStore } = require('./notes-store');
const { handleMessage } = require('./commands');

// --- Configuración ---
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error(
    'Falta la variable TELEGRAM_BOT_TOKEN.\n' +
      'Creá tu bot con @BotFather en Telegram, copiá el token y ejecutá:\n' +
      '  TELEGRAM_BOT_TOKEN=123456:ABC... npm start'
  );
  process.exit(1);
}

const DATA_DIR = process.env.NOTES_DATA_DIR || path.join(__dirname, '..', 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

// Opcional: limitar el bot a tu propio chat. Si definís TELEGRAM_ALLOWED_CHAT_ID,
// el bot ignora a cualquier otra persona (útil porque el bot es público en Telegram).
const ALLOWED = (process.env.TELEGRAM_ALLOWED_CHAT_ID || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const store = new NotesStore(NOTES_FILE);
const bot = new TelegramBot(TOKEN, { polling: true });

/**
 * Envía un mensaje intentando formato Markdown; si el texto rompe el parser
 * de Telegram, reintenta como texto plano para no perder el mensaje.
 */
async function safeSend(chatId, text) {
  try {
    return await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err) {
    return bot.sendMessage(chatId, text);
  }
}

bot.on('message', async (msg) => {
  const chatId = String(msg.chat.id);
  if (ALLOWED.length && !ALLOWED.includes(chatId)) return;

  // Telegram puede mandar comandos como "/recordar@MiBot": sacamos el @bot.
  const body = (msg.text || '').replace(/^(\/\w+)@\w+/, '$1');
  if (!body) return;

  try {
    const reply = handleMessage(store, chatId, body);
    await safeSend(chatId, reply);
  } catch (err) {
    console.error('Error procesando el mensaje:', err);
    await safeSend(chatId, 'Ups, hubo un error procesando tu mensaje. Probá de nuevo.').catch(() => {});
  }
});

bot.on('polling_error', (err) => {
  console.error('Error de conexión con Telegram:', err.message);
});

// --- Planificador de recordatorios ---
let schedulerTimer = null;

/**
 * Revisa cada 30s los recordatorios vencidos y los envía por Telegram.
 * Los que hayan vencido con el bot apagado se disparan al volver a arrancar.
 */
async function checkReminders() {
  const due = store.dueReminders();
  for (const { chatId, reminder } of due) {
    try {
      await safeSend(chatId, `⏰ *Recordatorio:* ${reminder.text}`);
      store.markReminderSent(chatId, reminder.id);
      console.log(`Recordatorio ${reminder.id} enviado a ${chatId}.`);
    } catch (err) {
      console.error(`No pude enviar el recordatorio ${reminder.id}:`, err.message);
      // No lo marcamos: se reintenta en el próximo ciclo.
    }
  }
}

schedulerTimer = setInterval(checkReminders, 30 * 1000);
checkReminders();

console.log('✅ Bot de notas y plazos (Telegram) en marcha. Escribile a tu bot.');

// Cierre ordenado.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    console.log(`\nRecibido ${signal}, cerrando...`);
    if (schedulerTimer) clearInterval(schedulerTimer);
    try {
      await bot.stopPolling();
    } finally {
      process.exit(0);
    }
  });
}
