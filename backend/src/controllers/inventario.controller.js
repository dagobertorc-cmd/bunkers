const inventarioService = require('../services/inventario.service');
const { ok } = require('../utils/response.utils');

const listar = (req, res, next) => {
  try {
    const resultado = inventarioService.listar({
      bunker_id:    req.query.bunker_id,
      producto_id:  req.query.producto_id,
      categoria_id: req.query.categoria_id,
      page:         req.query.page,
      limit:        req.query.limit,
    });
    return ok(res, resultado);
  } catch (err) {
    next(err);
  }
};

const critico = (req, res, next) => {
  try {
    const data = inventarioService.critico(req.query.bunker_id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
};

const actualizar = (req, res, next) => {
  try {
    const updated = inventarioService.actualizar(req.params.id, req.body);
    return ok(res, updated, 'Inventario actualizado');
  } catch (err) {
    next(err);
  }
};

const creaerhInv = (req, res, next) => {
  try {
    const resultado = inventarioService.crearh({
      categoria_id: req.query.categoria_id,
      buscar:       req.query.buscar,
      page:         req.query.page,
      limit:        req.query.limit,
    });
    return ok(res, resultado);
  } catch (err) { next(err); }
};

module.exports = { listar, critico, actualizar, creaerhInv };
