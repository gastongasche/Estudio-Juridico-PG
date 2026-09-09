'use strict';

/**
 * Interpreta una expresión de fecha/hora en español (formato argentino) que
 * aparece al comienzo de un texto, y separa el "cuándo" del "qué".
 *
 * Ejemplos que entiende (todo insensible a mayúsculas):
 *   "15/09 09:00 Contestar demanda"   -> 15 de sept, 09:00
 *   "15/09/2026 Vencimiento apelación" -> 15 de sept 2026, 09:00 (hora por defecto)
 *   "mañana Llamar al juzgado"         -> mañana, 09:00
 *   "mañana 8:30 Reunión"              -> mañana, 08:30
 *   "hoy 18:00 Cerrar escrito"         -> hoy, 18:00
 *   "en 2 horas Tomar café"            -> ahora + 2 horas
 *   "en 3 dias Presentar prueba"       -> ahora + 3 días (a la misma hora)
 *   "en 30 min Estirar"                -> ahora + 30 minutos
 *
 * Usa el reloj y la zona horaria de la computadora donde corre el bot.
 *
 * @param {string} input
 * @param {Date} [now]
 * @returns {{ date: Date, text: string } | null} null si no reconoce una fecha.
 */
function parseWhen(input, now = new Date()) {
  const raw = (input || '').trim();
  if (!raw) return null;

  const DEFAULT_HOUR = 9;
  const DEFAULT_MIN = 0;

  // Hora opcional "HH:MM" o "HH.MM" o "HH hs".
  const timeRe = /(\d{1,2})(?:[:.](\d{2}))?\s*(?:hs?|horas?)?/;

  // --- 1) Relativo: "en N unidad" ---
  const rel = raw.match(/^en\s+(\d+)\s*(min(?:uto)?s?|h(?:ora)?s?|d(?:[ií]a)?s?|sem(?:ana)?s?)\b\s*([\s\S]*)$/i);
  if (rel) {
    const n = parseInt(rel[1], 10);
    const unit = rel[2].toLowerCase();
    const text = rel[3].trim();
    const date = new Date(now.getTime());
    if (unit.startsWith('min')) date.setMinutes(date.getMinutes() + n);
    else if (unit.startsWith('h')) date.setHours(date.getHours() + n);
    else if (unit.startsWith('sem')) date.setDate(date.getDate() + n * 7);
    else date.setDate(date.getDate() + n); // días
    return { date, text };
  }

  // --- 2) "hoy" / "mañana" [hora] ---
  const rel2 = raw.match(/^(hoy|ma[ñn]ana|pasado\s+ma[ñn]ana)\b\s*([\s\S]*)$/i);
  if (rel2) {
    const word = rel2[1].toLowerCase();
    let after = rel2[2].trim();
    const date = new Date(now.getTime());
    if (/^ma[ñn]ana$/.test(word)) date.setDate(date.getDate() + 1);
    else if (/^pasado/.test(word)) date.setDate(date.getDate() + 2);

    let hour = DEFAULT_HOUR;
    let min = DEFAULT_MIN;
    const t = after.match(new RegExp('^' + timeRe.source, 'i'));
    if (t) {
      hour = parseInt(t[1], 10);
      min = t[2] ? parseInt(t[2], 10) : 0;
      after = after.slice(t[0].length).trim();
    }
    if (!isValidTime(hour, min)) return null;
    date.setHours(hour, min, 0, 0);
    return { date, text: after };
  }

  // --- 3) Fecha explícita "DD/MM" o "DD/MM/AAAA" [hora] ---
  const dateRe = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b\s*([\s\S]*)$/;
  const m = raw.match(dateRe);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    let year = m[3] ? parseInt(m[3], 10) : now.getFullYear();
    if (m[3] && m[3].length === 2) year += 2000;
    let after = m[4].trim();

    let hour = DEFAULT_HOUR;
    let min = DEFAULT_MIN;
    const t = after.match(new RegExp('^' + timeRe.source, 'i'));
    if (t) {
      hour = parseInt(t[1], 10);
      min = t[2] ? parseInt(t[2], 10) : 0;
      after = after.slice(t[0].length).trim();
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || !isValidTime(hour, min)) return null;
    const date = new Date(year, month - 1, day, hour, min, 0, 0);
    // Validar que la fecha exista (ej: 31/02 no).
    if (date.getDate() !== day || date.getMonth() !== month - 1) return null;

    // Si no se puso año y la fecha ya pasó este año, asumir el año que viene.
    if (!m[3] && date.getTime() < now.getTime()) {
      date.setFullYear(year + 1);
    }
    return { date, text: after };
  }

  return null;
}

function isValidTime(h, m) {
  return Number.isInteger(h) && Number.isInteger(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

/** Formatea una fecha para mostrar al usuario (es-AR). */
function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' });
}

module.exports = { parseWhen, formatDate };
