const db = require("../db/connect_db");
const { plantSchema } = require("../models/Schema");
const { eq } = require("drizzle-orm");

const getAllPlants = async () => {
  return await db.select().from(plantSchema);
};

const createPlant = async (data) => {
  return await db.insert(plantSchema).values(data);
};

const updatePlant = async (id, data) => {
  return await db.update(plantSchema).set(data).where(eq(plantSchema.id, id));
};

const deletePlant = async (id) => {
  return await db.delete(plantSchema).where(eq(plantSchema.id, id));
};

module.exports = {
  getAllPlants,
  createPlant,
  updatePlant,
  deletePlant,
};
