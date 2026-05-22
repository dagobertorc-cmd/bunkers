const bcrypt = require('bcryptjs');

const ROUNDS = process.env.NODE_ENV === 'production' ? 12 : 10;

const hash    = (plain)        => bcrypt.hash(plain, ROUNDS);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hash, compare };
