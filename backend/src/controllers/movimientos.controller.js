const movimientosService = require('../services/movimientos.service');
const { ok, created, notFound, businessError } = require('../utils/response.utils');
const audit = require('../utils/audit');

const crear = async (req, res, next) => {
  try {
    const datos = {
      ...req.body,
      usuario_id:     req.user.id,
      foto_evidencia: req.file?.path || null,
    };
    const movimiento = await movimientosService.crear(datos);
    audit.registrar({ usuarioId: req.user.id, accion: 'CREAR', tabla: 'movimientos', registroId: movimiento.id, datos: { folio: movimiento.folio, ...datos }, ip: req.ip });
    return created(res, movimiento, 'Movimiento registrado correctamente');
  } catch (err) {
    if (err.type === 'BUSINESS_ERROR') return businessError(res, err.message);
    next(err);
  }
};

const listar = async (req, res, next) => {
  try {
    const filtros = {
      bunker_id:       req.query.bunker_id,
      tipo_movimiento: req.query.tipo,
      producto_id:     req.query.producto_id,
      usuario_id:      req.query.usuario_id,
      fecha_desde:     req.query.fecha_desde,
      fecha_hasta:     req.query.fecha_hasta,
      ticket_id:       req.query.ticket_id,
      page:            req.query.page,
      limit:           req.query.limit,
    };
    const resultado = await movimientosService.listar(filtros);
    return ok(res, resultado);
  } catch (err) {
    next(err);
  }
};

const obtener = async (req, res, next) => {
  try {
    const movimiento = movimientosService.obtenerPorId(req.params.id);
    if (!movimiento) return notFound(res, 'Movimiento no encontrado');
    return ok(res, movimiento);
  } catch (err) {
    next(err);
  }
};

module.exports = { crear, listar, obtener };
