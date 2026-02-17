const { and, eq } = require("drizzle-orm");
const db = require("../db/connect_db");
const { departmentSchema } = require("../models/Schema");

const getDepartments = async (limit, offset, plantId) => {
  return db.query.departmentSchema.findMany({
    where: plantId ? eq(departmentSchema.plantId, plantId) : undefined,
    with: {
      plant: true,
    },
    limit,
    offset,
  });
};

const getTotalDepartments = async (plantId) => {
  const result = await db.query.departmentSchema.findMany({
    where: plantId ? eq(departmentSchema.plantId, plantId) : undefined,
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

const getDepartmentByIdAndPlantId = async (id, plantId) => {
  return (
    (await db.query.departmentSchema.findFirst({
      where: and(eq(departmentSchema.id, id), eq(departmentSchema.plantId, plantId)),
    })) || null
  );
};

const getDepartmentSelections = async (plantId) => {
  return db.query.departmentSchema.findMany({
    where: plantId ? eq(departmentSchema.plantId, plantId) : undefined,
    columns: {
      id: true,
      plantId: true,
      depName: true,
      depCode: true,
    },
  });
};

const createDepartment = async (data) => {
  return db.insert(departmentSchema).values(data);
};

const updateDepartment = async (id, data) => {
  return db.update(departmentSchema).set(data).where(eq(departmentSchema.id, id));
};

const deleteDepartment = async (id) => {
  return db.delete(departmentSchema).where(eq(departmentSchema.id, id));
};

module.exports = {
  getDepartments,
  getTotalDepartments,
  getDepartmentById,
  getDepartmentByIdAndPlantId,
  getDepartmentSelections,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
