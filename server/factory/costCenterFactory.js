const { and, desc, eq, ilike, inArray, or, sql } = require("drizzle-orm");
const db = require("../db/connect_db");
const { costCenterSchema, plantSchema } = require("../models/Schema");

const buildCostCenterWhere = (filters = {}) => {
  const conditions = [];
  if (filters.plantId) {
    conditions.push(eq(costCenterSchema.plantId, filters.plantId));
  }
  if (filters.depId) {
    conditions.push(eq(costCenterSchema.depId, filters.depId));
  }
  const search = filters.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    const matchingPlantIds = db
      .select({ id: plantSchema.id })
      .from(plantSchema)
      .where(
        or(
          ilike(plantSchema.name, pattern),
          ilike(sql`${plantSchema.code}::text`, pattern),
        ),
      );

    conditions.push(
      or(
        ilike(costCenterSchema.costCenterName, pattern),
        ilike(sql`${costCenterSchema.costCenterCode}::text`, pattern),
        ilike(sql`${costCenterSchema.description}::text`, pattern),
        inArray(costCenterSchema.plantId, matchingPlantIds),
      ),
    );
  }
  if (conditions.length === 0) {
    return undefined;
  }
  return conditions.length === 1 ? conditions[0] : and(...conditions);
};

const getCostCenters = async (limit, offset, filters = {}) => {
  return db.query.costCenterSchema.findMany({
    where: buildCostCenterWhere(filters),
    with: {
      plant: true,
      department: true,
      workCenter: true,
    },
    orderBy: [
      desc(costCenterSchema.updatedAt),
      desc(costCenterSchema.createdAt),
      desc(costCenterSchema.id),
    ],
    limit,
    offset,
  });
};

const getTotalCostCenters = async (filters = {}) => {
  const result = await db.query.costCenterSchema.findMany({
    where: buildCostCenterWhere(filters),
    columns: {
      id: true,
    },
  });
  return result.length;
};

const getCostCenterById = async (id) => {
  return (
    (await db.query.costCenterSchema.findFirst({
      where: eq(costCenterSchema.id, id),
      with: {
        plant: true,
        department: true,
        workCenter: true,
      },
    })) || null
  );
};

const createCostCenter = async (data) => {
  const existingCostCenter = await db.query.costCenterSchema.findFirst({
    where: eq(costCenterSchema.costCenterCode, data.costCenterCode),
  });

  if (existingCostCenter) {
    throw new Error("Cost center code already exists");
  }

  const created = await db
    .insert(costCenterSchema)
    .values(data)
    .returning({ id: costCenterSchema.id });
  return created[0];
};

const updateCostCenter = async (id, data) => {
  if (data.costCenterCode) {
    const existingCostCenter = await db.query.costCenterSchema.findFirst({
      where: eq(costCenterSchema.costCenterCode, data.costCenterCode),
    });

    if (existingCostCenter && existingCostCenter.id !== id) {
      throw new Error("Cost center code already exists");
    }
  }

  return db
    .update(costCenterSchema)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(costCenterSchema.id, id));
};

const deleteCostCenter = async (id) => {
  return db.delete(costCenterSchema).where(eq(costCenterSchema.id, id));
};

module.exports = {
  getCostCenters,
  getTotalCostCenters,
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
};
