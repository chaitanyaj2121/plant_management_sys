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

  return {
    pagination,
    plants,
    totalPages: pagination.totalPages,
  };
};

const getPlantSelections = async () => {
  const plants = await plantFactory.getPlantSelections();
  return { plants };
};

const getPlantById = async (id) => {
  const plantId = Number(id);
  const plant = await plantFactory.getPlantById(plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }
  return { plant };
};

const createPlant = async (body) => {
  if (!body.name || !body.code) {
    throw new Error("name and code are required");
  }

  const plantData = {
    name: body.name,
    des: body.des || "",
    code: body.code,
  };

  return await plantFactory.createPlant(plantData);
};

const updatePlant = async (id, body) => {
  const plantId = Number(id);
  const existingPlant = await plantFactory.getPlantById(plantId);
  if (!existingPlant) {
    throw new Error("Plant not found");
  }

  return await plantFactory.updatePlant(plantId, body);
};

const deletePlant = async (id) => {
  const plantId = Number(id);
  const existingPlant = await plantFactory.getPlantById(plantId);
  if (!existingPlant) {
    throw new Error("Plant not found");
  }

  return await plantFactory.deletePlant(plantId);
};

module.exports = {
  getPlants,
  getPlantSelections,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
};
