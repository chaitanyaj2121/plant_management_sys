const { and, desc, eq, ilike, inArray, or, sql } = require("drizzle-orm");
const db = require("../db/connect_db");
const { departmentSchema, plantSchema } = require("../models/Schema");

const buildDepartmentWhere = (filters = {}) => {
  const conditions = [];

  if (filters.plantId) {
    conditions.push(eq(departmentSchema.plantId, filters.plantId));
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
        ilike(departmentSchema.depName, pattern),
        ilike(sql`${departmentSchema.depCode}::text`, pattern),
        ilike(sql`${departmentSchema.depDescription}::text`, pattern),
        inArray(departmentSchema.plantId, matchingPlantIds),
      ),
    );
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : and(...conditions);
};

const getDepartments = async (limit, offset, filters = {}) => {
  return db.query.departmentSchema.findMany({
    where: buildDepartmentWhere(filters),
    with: {
      plant: true,
    },
    orderBy: [
      desc(departmentSchema.updatedAt),
      desc(departmentSchema.createdAt),
      desc(departmentSchema.id),
    ],
    limit,
    offset,
  });
};

const getTotalDepartments = async (filters = {}) => {
  const result = await db.query.departmentSchema.findMany({
    where: buildDepartmentWhere(filters),
    columns: {
      id: true,
    },
  });
  return result.length;
};

const getDepartmentById = async (id) => {
  return (
    (await db.query.departmentSchema.findFirst({
      where: eq(departmentSchema.id, id),
      with: {
        plant: true,
      },
    })) || null
  );
};

const getDepartmentSelections = async (plantId) => {
  return db.query.departmentSchema.findMany({
    where: plantId ? eq(departmentSchema.plantId, plantId) : undefined,
    columns: {
      id: true,
      // plantId: true,
      depName: true,
    },
  });
};

const createDepartment = async (data) => {
  const existingDept = await db.query.departmentSchema.findFirst({
    where: eq(departmentSchema.depCode, data.depCode),
  });

  if (existingDept) {
    throw new Error("Department code already exists");
  }

  return db.insert(departmentSchema).values(data).returning();
};

const updateDepartment = async (id, data) => {
  if (data.depCode) {
    const existingDept = await db.query.departmentSchema.findFirst({
      where: eq(departmentSchema.depCode, data.depCode),
    });

    if (existingDept && existingDept.id !== id) {
      throw new Error("Department code already exists");
    }
  }

  return db
    .update(departmentSchema)
    .set({ ...data, updatedAt: sql`now()` })
    .where(eq(departmentSchema.id, id))
    .returning();
};

const deleteDepartment = async (id) => {
  return db.delete(departmentSchema).where(eq(departmentSchema.id, id));
};

module.exports = {
  getDepartments,
  getTotalDepartments,
  getDepartmentById,
  getDepartmentSelections,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
