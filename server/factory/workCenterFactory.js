const { and, desc, eq, ilike, inArray, or, sql } = require("drizzle-orm");
const db = require("../db/connect_db");
const { plantSchema, workCenterSchema } = require("../models/Schema");

const buildWorkCenterWhere = (filters = {}) => {
  const conditions = [];
  if (filters.plantId) {
    conditions.push(eq(workCenterSchema.plantId, filters.plantId));
  }
  if (filters.depId) {
    conditions.push(eq(workCenterSchema.depId, filters.depId));
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
        ilike(workCenterSchema.workName, pattern),
        ilike(sql`${workCenterSchema.workCode}::text`, pattern),
        ilike(sql`${workCenterSchema.workDescription}::text`, pattern),
        inArray(workCenterSchema.plantId, matchingPlantIds),
      ),
    );
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
      costCenters: true,
    },
    orderBy: [
      desc(workCenterSchema.updatedAt),
      desc(workCenterSchema.createdAt),
      desc(workCenterSchema.id),
    ],
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
        costCenters: true,
      },
    })) || null
  );
};

const createWorkCenter = async (data) => {
  const existingWorkCenter = await db.query.workCenterSchema.findFirst({
    where: eq(workCenterSchema.workCenterCode, data.workCenterCode),
  });

  if (existingWorkCenter) {
    throw new Error("Work center code already exists");
  }

  return db.insert(workCenterSchema).values(data).returning();
};

const updateWorkCenter = async (id, data) => {
  if (data.workCenterCode) {
    const existingWorkCenter = await db.query.workCenterSchema.findFirst({
      where: eq(workCenterSchema.workCenterCode, data.workCenterCode),
    });

    if (existingWorkCenter && existingWorkCenter.id !== id) {
      throw new Error("Work center code already exists");
    }
  }

  return db
    .update(workCenterSchema)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(workCenterSchema.id, id));
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
      // plantId: true,
      // depId: true,
      // costCenterId: true,
      workName: true,
      // workCode: true,
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
