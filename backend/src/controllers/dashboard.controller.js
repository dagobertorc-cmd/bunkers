const dashboardService = require('../services/dashboard.service');
const { ok } = require('../utils/response.utils');

const kpis = (_req, res, next) => {
  try { return ok(res, dashboardService.kpis()); } catch (e) { next(e); }
};

const consumoPorBunker = (_req, res, next) => {
  try { return ok(res, dashboardService.consumoPorBunker()); } catch (e) { next(e); }
};

const topProductos = (req, res, next) => {
  try { return ok(res, dashboardService.topProductos(req.query.limit)); } catch (e) { next(e); }
};

const movimientosRecientes = (req, res, next) => {
  try { return ok(res, dashboardService.movimientosRecientes(req.query.limit)); } catch (e) { next(e); }
};

module.exports = { kpis, consumoPorBunker, topProductos, movimientosRecientes };
