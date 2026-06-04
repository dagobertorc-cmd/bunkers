const authService    = require('../services/auth.service');
const { ok, badRequest } = require('../utils/response.utils');
const audit          = require('../utils/audit');

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   8 * 60 * 60 * 1000, // 8h en ms
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'Email y password requeridos');
    const { token, user } = await authService.login(email, password);
    res.cookie('token', token, COOKIE_OPTS);
    audit.registrar({ usuarioId: user.id, accion: 'LOGIN', tabla: 'usuarios', registroId: user.id, ip: req.ip });
    return ok(res, { user }, 'Login exitoso');
  } catch (err) {
    if (err.type === 'AUTH_ERROR') return res.status(401).json({ success: false, message: err.message });
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.me(req.user.id);
    return ok(res, user);
  } catch (err) { next(err); }
};

const logout = (req, res) => {
  if (req.user) {
    audit.registrar({ usuarioId: req.user.id, accion: 'LOGOUT', tabla: 'usuarios', registroId: req.user.id, ip: req.ip });
  }
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
    secure:   process.env.NODE_ENV === 'production',
  });
  return ok(res, null, 'Sesión cerrada');
};

module.exports = { login, me, logout };
