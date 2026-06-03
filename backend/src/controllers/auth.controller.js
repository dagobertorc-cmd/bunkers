const authService = require('../services/auth.service');
const { ok, badRequest } = require('../utils/response.utils');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return badRequest(res, 'Email y password requeridos');
    const result = await authService.login(email, password);
    return ok(res, result, 'Login exitoso');
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

const logout = (_req, res) => ok(res, null, 'Sesión cerrada');

module.exports = { login, me, logout };
