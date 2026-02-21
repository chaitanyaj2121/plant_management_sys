const db = require("../db/connect_db");
const { plantSchema } = require("../models/Schema");
const { and, desc, eq, ilike, or, sql } = require("drizzle-orm");

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
    orderBy: [
      desc(plantSchema.updatedAt),
      desc(plantSchema.createdAt),
      desc(plantSchema.id),
    ],
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
  const result = await db
    .select()
    .from(plantSchema)
    .where(eq(plantSchema.id, id));
  return result[0] || null;
};

const getPlantSelections = async () => {
  return db
    .select({
      id: plantSchema.id,
      name: plantSchema.name,
    })
    .from(plantSchema);
};

const createPlant = async (data) => {
  const existingPlant = await db.query.plantSchema.findFirst({
    where: eq(plantSchema.code, data.code),
  });

  if (existingPlant) {
    throw new Error("Plant code already exists");
  }

  return await db.insert(plantSchema).values(data).returning();
};

const updatePlant = async (id, data) => {
  if (data.code) {
    const existingPlant = await db.query.plantSchema.findFirst({
      where: eq(plantSchema.code, data.code),
    });

    if (existingPlant && existingPlant.id !== id) {
      throw new Error("Plant code already exists");
    }
  }

  return await db
    .update(plantSchema)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(plantSchema.id, id));
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
