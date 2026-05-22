// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  console.error('❌', err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
};

module.exports = errorHandler;
