'use strict';

const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const { NotesStore } = require('./notes-store');
const { handleMessage } = require('./commands');

// --- Configuración ---
const DATA_DIR = process.env.NOTES_DATA_DIR || path.join(__dirname, '..', 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const SESSION_DIR = path.join(DATA_DIR, 'session');

const store = new NotesStore(NOTES_FILE);

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_DIR }),
  puppeteer: {
    headless: true,
    // Flags necesarios para correr Chromium en servidores/containers.
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\nEscaneá este QR con WhatsApp (Ajustes → Dispositivos vinculados):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('Autenticado correctamente.');
});

client.on('auth_failure', (msg) => {
  console.error('Fallo de autenticación:', msg);
});

client.on('ready', () => {
  console.log('✅ Bot de notas listo. Enviá un mensaje al número vinculado.');
});

client.on('disconnected', (reason) => {
  console.warn('Cliente desconectado:', reason);
});

client.on('message', async (message) => {
  // Ignorar mensajes de estados/broadcast y de grupos (bloc personal).
  if (message.isStatus) return;
  const chat = await message.getChat().catch(() => null);
  if (chat && chat.isGroup) return;

  try {
    const reply = handleMessage(store, message.from, message.body);
    await message.reply(reply);
  } catch (err) {
    console.error('Error procesando el mensaje:', err);
    await message.reply('Ups, hubo un error procesando tu mensaje. Probá de nuevo.').catch(() => {});
  }
});

client.initialize();

// Cierre ordenado.
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    console.log(`\nRecibido ${signal}, cerrando...`);
    try {
      await client.destroy();
    } finally {
      process.exit(0);
    }
  });
}
