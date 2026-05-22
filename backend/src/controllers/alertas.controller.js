const alertasService = require('../services/alertas.service');
const { ok } = require('../utils/response.utils');
const { paginate } = require('../utils/pagination.utils');

const listar = (req, res, next) => {
  try {
    const { page, limit, offset } = paginate(req.query.page, req.query.limit);
    const leida = req.query.leida !== undefined ? req.query.leida === 'true' : undefined;
    const resultado = alertasService.listar({ leida, page, limit, offset });
    return ok(res, resultado);
  } catch (err) {
    next(err);
  }
};

const marcarLeida = (req, res, next) => {
  try {
    const alerta = alertasService.marcarLeida(req.params.id, req.user.id);
    return ok(res, alerta, 'Alerta marcada como leída');
  } catch (err) {
    next(err);
  }
};

module.exports = { listar, marcarLeida };
