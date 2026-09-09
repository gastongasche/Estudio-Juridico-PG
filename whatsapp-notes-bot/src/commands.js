'use strict';

/**
 * Procesa el texto de un mensaje entrante y devuelve la respuesta del bot.
 *
 * Comandos soportados (con o sin la barra inicial):
 *   /nota <texto>      Guarda una nota.
 *   /lista             Lista todas las notas.
 *   /buscar <texto>    Busca notas por texto.
 *   /borrar <id>       Borra la nota con ese id.
 *   /limpiar           Borra todas las notas.
 *   /ayuda             Muestra la ayuda.
 *
 * Si el mensaje no empieza con un comando conocido, se guarda como nota
 * directamente (modo "todo lo que escribís es una nota").
 */

const HELP = [
  '📝 *Bot de Notas*',
  '',
  'Comandos disponibles:',
  '• `/nota <texto>` — guarda una nota',
  '• `/lista` — muestra todas tus notas',
  '• `/buscar <texto>` — busca en tus notas',
  '• `/borrar <id>` — borra una nota por su número',
  '• `/limpiar` — borra todas tus notas',
  '• `/ayuda` — muestra este mensaje',
  '',
  'Tip: si escribís cualquier texto sin comando, se guarda como nota automáticamente.',
].join('\n');

function formatNote(n) {
  const date = new Date(n.createdAt);
  const stamp = isNaN(date.getTime())
    ? n.createdAt
    : date.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  return `*${n.id}.* ${n.text}\n   _${stamp}_`;
}

/**
 * @param {import('./notes-store').NotesStore} store
 * @param {string} chatId
 * @param {string} body Texto crudo del mensaje.
 * @returns {string} Respuesta a enviar.
 */
function handleMessage(store, chatId, body) {
  const text = (body || '').trim();
  if (!text) return 'No recibí ningún texto. Escribí `/ayuda` para ver los comandos.';

  const match = text.match(/^\/?(\w+)(?:\s+([\s\S]*))?$/);
  const command = match ? match[1].toLowerCase() : '';
  const rest = match && match[2] ? match[2].trim() : '';

  switch (command) {
    case 'ayuda':
    case 'help':
    case 'start':
      return HELP;

    case 'nota':
    case 'note':
    case 'n': {
      if (!rest) return 'Escribí el texto después del comando. Ej: `/nota comprar café`.';
      const note = store.add(chatId, rest);
      return `✅ Nota *${note.id}* guardada.`;
    }

    case 'lista':
    case 'list':
    case 'notas': {
      const notes = store.list(chatId);
      if (notes.length === 0) return 'No tenés notas todavía. Escribí `/nota <texto>` para crear una.';
      return `📋 *Tus notas (${notes.length}):*\n\n${notes.map(formatNote).join('\n\n')}`;
    }

    case 'buscar':
    case 'search':
    case 'b': {
      if (!rest) return 'Escribí qué querés buscar. Ej: `/buscar reunión`.';
      const found = store.search(chatId, rest);
      if (found.length === 0) return `🔍 No encontré notas con "${rest}".`;
      return `🔍 *${found.length} resultado(s) para "${rest}":*\n\n${found.map(formatNote).join('\n\n')}`;
    }

    case 'borrar':
    case 'delete':
    case 'del': {
      const id = parseInt(rest, 10);
      if (!Number.isInteger(id)) return 'Indicá el número de la nota. Ej: `/borrar 3`.';
      const ok = store.remove(chatId, id);
      return ok ? `🗑️ Nota *${id}* borrada.` : `No encontré una nota con el número ${id}.`;
    }

    case 'limpiar':
    case 'clear': {
      const count = store.clear(chatId);
      return count > 0 ? `🧹 Borré ${count} nota(s).` : 'No tenías notas para borrar.';
    }

    default: {
      // No es un comando conocido: se guarda el mensaje entero como nota.
      const note = store.add(chatId, text);
      return `✅ Nota *${note.id}* guardada.\n_(Escribí /ayuda para ver los comandos)_`;
    }
  }
}

module.exports = { handleMessage, HELP };
