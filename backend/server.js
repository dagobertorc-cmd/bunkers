const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const routes       = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');
const logger       = require('./src/middlewares/logger.middleware');
const { initDB, getDB } = require('./src/config/database');
const { validateTipos } = require('./src/services/tiposMovimiento');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);

app.get('/health', async (_req, res) => {
  try {
    await getDB().query('SELECT 1');
    res.json({ status: 'ok', version: '1.0.0', db: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', version: '1.0.0', db: 'unreachable' });
  }
});

app.use(errorHandler);

initDB()
  .then(validateTipos)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Bunkers API corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al inicializar:', err.message);
    process.exit(1);
  });
