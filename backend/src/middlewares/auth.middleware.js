const { verify } = require('../utils/jwt.utils');

const verifyToken = (req, res, next) => {
  // Cookie httpOnly primero; fallback a Authorization header para clientes API
  const token = req.cookies?.token || (() => {
    const h = req.headers['authorization'];
    return h && h.startsWith('Bearer ') ? h.slice(7) : null;
  })();

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }

  try {
    req.user = verify(token);
    next();
  } catch {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Sin autenticación' });

  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Roles permitidos: ${roles.join(', ')}`,
    });
  }
  next();
};

module.exports = { verifyToken, requireRoles };
