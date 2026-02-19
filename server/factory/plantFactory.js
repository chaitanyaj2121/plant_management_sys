const db = require("../db/connect_db");
const { plantSchema } = require("../models/Schema");
const { and, eq, ilike, or, sql } = require("drizzle-orm");

const buildPlantWhere = (filters = {}) => {
  const conditions = [];
  const search = filters.search?.trim();

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(plantSchema.name, pattern),
        ilike(sql`${plantSchema.code}::text`, pattern),
      ),
    );
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : and(...conditions);
};

const getAllPlants = async (limit, offset, filters = {}) => {
  return await db.query.plantSchema.findMany({
    where: buildPlantWhere(filters),
    limit,
    offset,
  });
};

const getTotalPlants = async (filters = {}) => {
  const result = await db.query.plantSchema.findMany({
    where: buildPlantWhere(filters),
    columns: {
      id: true,
    },
  });
  return result.length;
};

const getPlantById = async (id) => {
  const result = await db.select().from(plantSchema).where(eq(plantSchema.id, id));
  return result[0] || null;
};

const getPlantSelections = async () => {
  return db
    .select({
      id: plantSchema.id,
      name: plantSchema.name,
      code: plantSchema.code,
    })
    .from(plantSchema);
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
  getTotalPlants,
  getPlantById,
  getPlantSelections,
  createPlant,
  updatePlant,
  deletePlant,
};
