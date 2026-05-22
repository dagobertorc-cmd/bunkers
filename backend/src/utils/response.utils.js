const ok = (res, data, message = 'OK', status = 200) =>
  res.status(status).json({ success: true, message, data });

const created = (res, data, message = 'Creado correctamente') =>
  ok(res, data, message, 201);

const notFound = (res, message = 'No encontrado') =>
  res.status(404).json({ success: false, message });

const badRequest = (res, message) =>
  res.status(400).json({ success: false, message });

const forbidden = (res, message = 'Acceso denegado') =>
  res.status(403).json({ success: false, message });

const businessError = (res, message) =>
  res.status(422).json({ success: false, message });

module.exports = { ok, created, notFound, badRequest, forbidden, businessError };
