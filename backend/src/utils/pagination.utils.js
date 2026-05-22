const paginate = (page = 1, limit = 20) => ({
  page:   Math.max(1, parseInt(page)),
  limit:  Math.min(100, Math.max(1, parseInt(limit))),
  offset: (Math.max(1, parseInt(page)) - 1) * Math.min(100, Math.max(1, parseInt(limit))),
});

const paginatedResponse = (data, total, page, limit) => ({
  data,
  total,
  page,
  limit,
  pages: Math.ceil(total / limit),
});

module.exports = { paginate, paginatedResponse };
