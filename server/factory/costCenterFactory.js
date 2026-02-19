const { and, eq, ilike, inArray, or, sql } = require("drizzle-orm");
const db = require("../db/connect_db");
const { costCenterSchema, workCenterSchema } = require("../models/Schema");

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
    conditions.push(
      or(
        ilike(costCenterSchema.costCenterName, pattern),
        ilike(sql`${costCenterSchema.costCenterCode}::text`, pattern),
        ilike(sql`${costCenterSchema.description}::text`, pattern),
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
      workCenters: true,
    },
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
        workCenters: true,
      },
    })) || null
  );
};

const createCostCenter = async (data) => {
  const created = await db
    .insert(costCenterSchema)
    .values(data)
    .returning({ id: costCenterSchema.id });
  return created[0];
};

const updateCostCenter = async (id, data) => {
  return db.update(costCenterSchema).set(data).where(eq(costCenterSchema.id, id));
};

const deleteCostCenter = async (id) => {
  return db.delete(costCenterSchema).where(eq(costCenterSchema.id, id));
};

const getWorkCentersByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }
  return db.query.workCenterSchema.findMany({
    where: inArray(workCenterSchema.id, ids),
  });
};

const assignCostCenterToWorkCenters = async (workCenterIds, costCenterId) => {
  if (!workCenterIds || workCenterIds.length === 0) {
    return;
  }
  return db
    .update(workCenterSchema)
    .set({ costCenterId })
    .where(inArray(workCenterSchema.id, workCenterIds));
};

const removeCostCenterFromWorkCenters = async (costCenterId, keepIds = []) => {
  const existing = await db
    .select({ id: workCenterSchema.id })
    .from(workCenterSchema)
    .where(eq(workCenterSchema.costCenterId, costCenterId));

  const existingIds = existing.map((row) => row.id);
  const toClear = existingIds.filter((id) => !keepIds.includes(id));

  if (toClear.length === 0) {
    return;
  }

  return db
    .update(workCenterSchema)
    .set({ costCenterId: null })
    .where(inArray(workCenterSchema.id, toClear));
};

module.exports = {
  getCostCenters,
  getTotalCostCenters,
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getWorkCentersByIds,
  assignCostCenterToWorkCenters,
  removeCostCenterFromWorkCenters,
};
