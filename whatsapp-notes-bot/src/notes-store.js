'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Almacenamiento de notas en un archivo JSON local.
 *
 * Las notas se guardan por remitente (chatId) para que cada contacto
 * tenga su propio bloc. La API es deliberadamente chica para poder
 * reemplazar este módulo por Google Sheets o una base de datos más
 * adelante sin tocar el resto del bot.
 */
class NotesStore {
  /**
   * @param {string} filePath Ruta al archivo JSON de datos.
   */
  constructor(filePath) {
    this.filePath = filePath;
    /** @type {{ notes: Record<string, Array<{id:number, text:string, createdAt:string}>> }} */
    this.data = { notes: {} };
    this._load();
  }

  _load() {
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.notes) {
        this.data = parsed;
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error('No se pudo leer el archivo de notas, se empieza vacío:', err.message);
      }
      this.data = { notes: {} };
    }
  }

  _save() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
    // Escritura atómica: primero a un temporal y luego rename.
    const tmp = `${this.filePath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf8');
    fs.renameSync(tmp, this.filePath);
  }

  /** Devuelve el arreglo de notas de un usuario (crea la entrada si falta). */
  _bucket(chatId) {
    if (!this.data.notes[chatId]) {
      this.data.notes[chatId] = [];
    }
    return this.data.notes[chatId];
  }

  /**
   * Agrega una nota.
   * @returns {{id:number, text:string, createdAt:string}} La nota creada.
   */
  add(chatId, text) {
    const bucket = this._bucket(chatId);
    const nextId = bucket.reduce((max, n) => Math.max(max, n.id), 0) + 1;
    const note = { id: nextId, text: text.trim(), createdAt: new Date().toISOString() };
    bucket.push(note);
    this._save();
    return note;
  }

  /** Lista todas las notas de un usuario, en orden de creación. */
  list(chatId) {
    return [...this._bucket(chatId)];
  }

  /** Busca notas cuyo texto contenga el término (case-insensitive). */
  search(chatId, term) {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return this._bucket(chatId).filter((n) => n.text.toLowerCase().includes(q));
  }

  /**
   * Elimina una nota por id.
   * @returns {boolean} true si se eliminó, false si no existía.
   */
  remove(chatId, id) {
    const bucket = this._bucket(chatId);
    const idx = bucket.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    bucket.splice(idx, 1);
    this._save();
    return true;
  }

  /**
   * Borra todas las notas de un usuario.
   * @returns {number} Cantidad de notas eliminadas.
   */
  clear(chatId) {
    const count = this._bucket(chatId).length;
    this.data.notes[chatId] = [];
    this._save();
    return count;
  }
}

module.exports = { NotesStore };
