const { getDB }  = require('../config/database');
const { hash, compare } = require('../utils/bcrypt.utils');
const { sign }   = require('../utils/jwt.utils');

const login = async (email, password) => {
  const db   = getDB();
  const user = db.prepare(`
    SELECT u.*, r.nombre AS rol FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    WHERE u.email = ? AND u.activo = 1
  `).get(email);

  if (!user) throw { type: 'AUTH_ERROR', message: 'Credenciales inválidas' };

  const valid = await compare(password, user.password);
  if (!valid) throw { type: 'AUTH_ERROR', message: 'Credenciales inválidas' };

  db.prepare('UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  const token = sign({ id: user.id, email: user.email, rol: user.rol, bunker_id: user.bunker_id });
  const { password: _p, ...userData } = user;
  return { token, user: userData };
};

const me = (userId) => {
  const db = getDB();
  return db.prepare(`
    SELECT u.id, u.nombre, u.email, u.telefono, u.bunker_id,
           u.activo, u.ultimo_login, r.nombre AS rol,
           b.nombre AS bunker_nombre
    FROM usuarios u
    JOIN roles r ON u.rol_id = r.id
    LEFT JOIN bunkers b ON u.bunker_id = b.id
    WHERE u.id = ?
  `).get(userId);
};

module.exports = { login, me };
