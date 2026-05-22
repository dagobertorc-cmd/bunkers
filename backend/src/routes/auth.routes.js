const router = require('express').Router();
const ctrl   = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/login',  ctrl.login);
router.post('/logout', verifyToken, ctrl.logout);
router.get('/me',      verifyToken, ctrl.me);

module.exports = router;
