const parsePagination = (query) => {
  const page = Number.parseInt(query.page, 10) || 1;
  const limit = Number.parseInt(query.limit, 10) || 10;
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  return {
    page: safePage,
    limit: safeLimit,
    offset,
  };
};

const buildPaginationMeta = (totalCount, page, limit) => ({
  totalCount,
  totalPages: Math.ceil(totalCount / limit) || 1,
  page,
  limit,
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};

