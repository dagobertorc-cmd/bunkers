const svc = require('../services/requisiciones.service');
const { ok, created, notFound, businessError } = require('../utils/response.utils');

const listar = (req, res, next) => {
  try {
    const resultado = svc.listar({
      bunker_id: req.query.bunker_id,
      estado:    req.query.estado,
      page:      req.query.page,
      limit:     req.query.limit,
    });
    return ok(res, resultado);
  } catch (err) { next(err); }
};

const obtener = (req, res, next) => {
  try {
    const req_ = svc.obtener(req.params.id);
    if (!req_) return notFound(res, 'Requisición no encontrada');
    return ok(res, req_);
  } catch (err) { next(err); }
};

const crear = (req, res, next) => {
  try {
    const datos = { ...req.body, usuario_id: req.user.id };
    // Non-SUPERADMIN/ADMIN bunker_id is scoped to their own bunker
    if (!['SUPERADMIN','ADMIN'].includes(req.user.rol) && req.user.bunker_id) {
      datos.bunker_id = req.user.bunker_id;
    }
    const nueva = svc.crear(datos);
    return created(res, nueva, 'Requisición creada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    next(err);
  }
};

const actualizar = (req, res, next) => {
  try {
    const actualizada = svc.actualizar(req.params.id, { ...req.body, atendida_por: req.user.id });
    return ok(res, actualizada, 'Requisición actualizada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    if (err.type === 'NOT_FOUND')      return notFound(res, err.message);
    next(err);
  }
};

const cancelar = (req, res, next) => {
  try {
    const cancelada = svc.cancelar(req.params.id, req.user.id);
    return ok(res, cancelada, 'Requisición cancelada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    if (err.type === 'NOT_FOUND')      return notFound(res, err.message);
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, cancelar };
