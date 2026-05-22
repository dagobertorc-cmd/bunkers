const router = require('express').Router();
const ctrl   = require('../controllers/importar.controller');
const { verifyToken, requireRoles } = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post(
  '/xlsx',
  verifyToken,
  requireRoles('SUPERADMIN', 'ADMIN'),
  upload.single('archivo'),
  ctrl.importarXlsx
);

module.exports = router;
