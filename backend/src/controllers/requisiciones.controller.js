const svc = require('../services/requisiciones.service');
const { ok, created, notFound, businessError } = require('../utils/response.utils');

const listar = async (req, res, next) => {
  try {
    const resultado = await svc.listar({
      bunker_id: req.query.bunker_id,
      estado:    req.query.estado,
      page:      req.query.page,
      limit:     req.query.limit,
    });
    return ok(res, resultado);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const req_ = await svc.obtener(req.params.id);
    if (!req_) return notFound(res, 'Requisición no encontrada');
    return ok(res, req_);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const datos = { ...req.body, usuario_id: req.user.id };
    if (!['SUPERADMIN','ADMIN'].includes(req.user.rol) && req.user.bunker_id) {
      datos.bunker_id = req.user.bunker_id;
    }
    const nueva = await svc.crear(datos);
    return created(res, nueva, 'Requisición creada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const actualizada = await svc.actualizar(req.params.id, { ...req.body, atendida_por: req.user.id });
    return ok(res, actualizada, 'Requisición actualizada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    if (err.type === 'NOT_FOUND')      return notFound(res, err.message);
    next(err);
  }
};

const cancelar = async (req, res, next) => {
  try {
    const cancelada = await svc.cancelar(req.params.id, req.user.id);
    return ok(res, cancelada, 'Requisición cancelada');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    if (err.type === 'NOT_FOUND')      return notFound(res, err.message);
    next(err);
  }
};

module.exports = { listar, obtener, crear, actualizar, cancelar };
