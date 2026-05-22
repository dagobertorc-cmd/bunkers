const express = require('express');
const cors    = require('cors');
const path    = require('path');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const routes       = require('./src/routes');
const errorHandler = require('./src/middlewares/errorHandler');
const logger       = require('./src/middlewares/logger.middleware');
const { initDB }   = require('./src/config/database');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api', routes);
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '1.0.0' }));
app.use(errorHandler);

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Bunkers API corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Error al inicializar DB:', err);
  process.exit(1);
});
