const router    = require('express').Router();
const { body }  = require('express-validator');
const rateLimit = require('express-rate-limit');
const ctrl      = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate  = require('../middlewares/validate.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de login. Espera 15 minutos.' },
});

router.post('/login',
  loginLimiter,
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Password requerido'),
  validate,
  ctrl.login,
);
router.post('/logout', verifyToken, ctrl.logout);
router.get('/me',      verifyToken, ctrl.me);

module.exports = router;
