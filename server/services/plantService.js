const { v4: uuidv4 } = require("uuid");
const plantFactory = require("../factory/plantFactory");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const getPlants = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    search: query.search,
  };

  const plants = await plantFactory.getAllPlants(limit, offset, filters);
  const totalCount = await plantFactory.getTotalPlants(filters);
  const pagination = buildPaginationMeta(totalCount, page, limit);

  // Keep legacy keys for existing frontend consumers.
  return {
    data: plants,
    pagination,
    plants,
    totalPages: pagination.totalPages,
  };
};

const createPlant = async (body) => {
  if (!body.name || !body.code) {
    throw new Error("name and code are required");
  }

  const plantData = {
    id: uuidv4(),
    name: body.name,
    des: body.des || "",
    code: body.code,
  };

  return await plantFactory.createPlant(plantData);
};

const updatePlant = async (id, body) => {
  return await plantFactory.updatePlant(id, body);
};

const deletePlant = async (id) => {
  return await plantFactory.deletePlant(id);
};

module.exports = {
  getPlants,
  createPlant,
  updatePlant,
  deletePlant,
};
