const dashboardService = require('../services/dashboard.service');
const { ok } = require('../utils/response.utils');

const kpis = async (_req, res, next) => {
  try { return ok(res, await dashboardService.kpis()); } catch (e) { next(e); }
};

const consumoPorBunker = async (_req, res, next) => {
  try { return ok(res, await dashboardService.consumoPorBunker()); } catch (e) { next(e); }
};

const topProductos = async (req, res, next) => {
  try { return ok(res, await dashboardService.topProductos(req.query.limit)); } catch (e) { next(e); }
};

const movimientosRecientes = async (req, res, next) => {
  try { return ok(res, await dashboardService.movimientosRecientes(req.query.limit)); } catch (e) { next(e); }
};

module.exports = { kpis, consumoPorBunker, topProductos, movimientosRecientes };
