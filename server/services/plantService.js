const { v4: uuidv4 } = require("uuid");
const plantFactory = require("../factory/plantFactory");

const getPlants = async (page) => {
  const limit = 5;
  const offset = (page - 1) * limit;

  const plants = await plantFactory.getAllPlants(limit, offset);
  const totalCount = await plantFactory.getTotalPlants();

  const totalPages = Math.ceil(totalCount / limit);

  return {
    plants,
    totalPages,
  };
};

const createPlant = async (body) => {
  if (!body.name || !body.des || !body.code) {
    throw new Error("All fields are required");
  }

  const plantData = {
    id: uuidv4(),
    name: body.name,
    des: body.des,
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
