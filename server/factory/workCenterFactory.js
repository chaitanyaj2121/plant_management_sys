const { and, eq } = require("drizzle-orm");
const db = require("../db/connect_db");
const { workCenterSchema } = require("../models/Schema");

const buildWorkCenterWhere = (filters = {}) => {
  const conditions = [];
  if (filters.plantId) {
    conditions.push(eq(workCenterSchema.plantId, filters.plantId));
  }
  if (filters.depId) {
    conditions.push(eq(workCenterSchema.depId, filters.depId));
  }
  if (filters.costCenterId) {
    conditions.push(eq(workCenterSchema.costCenterId, filters.costCenterId));
  }
  if (conditions.length === 0) {
    return undefined;
  }
  return conditions.length === 1 ? conditions[0] : and(...conditions);
};

const getWorkCenters = async (limit, offset, filters = {}) => {
  return db.query.workCenterSchema.findMany({
    where: buildWorkCenterWhere(filters),
    with: {
      plant: true,
      department: true,
      costCenter: true,
    },
    limit,
    offset,
  });
};

const getTotalWorkCenters = async (filters = {}) => {
  const result = await db.query.workCenterSchema.findMany({
    where: buildWorkCenterWhere(filters),
    columns: {
      id: true,
    },
  });
  return result.length;
};

const getWorkCenterById = async (id) => {
  return (
    (await db.query.workCenterSchema.findFirst({
      where: eq(workCenterSchema.id, id),
      with: {
        plant: true,
        department: true,
        costCenter: true,
      },
    })) || null
  );
};

const createWorkCenter = async (data) => {
  return db.insert(workCenterSchema).values(data);
};

const updateWorkCenter = async (id, data) => {
  return db.update(workCenterSchema).set(data).where(eq(workCenterSchema.id, id));
};

const deleteWorkCenter = async (id) => {
  return db.delete(workCenterSchema).where(eq(workCenterSchema.id, id));
};

const getWorkCenterSelections = async (filters = {}) => {
  const conditions = [];
  if (filters.plantId) {
    conditions.push(eq(workCenterSchema.plantId, filters.plantId));
  }
  if (filters.depId) {
    conditions.push(eq(workCenterSchema.depId, filters.depId));
  }

  const whereCondition =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
      ? conditions[0]
      : and(...conditions);

  return db.query.workCenterSchema.findMany({
    where: whereCondition,
    columns: {
      id: true,
      plantId: true,
      depId: true,
      costCenterId: true,
      workName: true,
      workCode: true,
    },
  });
};

module.exports = {
  getWorkCenters,
  getTotalWorkCenters,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  getWorkCenterSelections,
};
