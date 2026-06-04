const { getDB } = require('../config/database');

const registrar = async ({ usuarioId, accion, tabla, registroId, datos, ip }) => {
  try {
    await getDB().execute(
      'INSERT INTO audit_log (usuario_id, accion, tabla, registro_id, datos, ip) VALUES (?, ?, ?, ?, ?, ?)',
      [usuarioId ?? null, accion, tabla, registroId ?? null, datos ? JSON.stringify(datos) : null, ip ?? null],
    );
  } catch (e) {
    console.warn('⚠️ Audit log failed:', e.message);
  }
};

module.exports = { registrar };
