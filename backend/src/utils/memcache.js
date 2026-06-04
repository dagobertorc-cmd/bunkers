const store = new Map();

const get = (key) => {
  const item = store.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) { store.delete(key); return null; }
  return item.value;
};

const set = (key, value, ttlMs = 60_000) => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const invalidate = (...keys) => keys.forEach(k => store.delete(k));

module.exports = { get, set, invalidate };
