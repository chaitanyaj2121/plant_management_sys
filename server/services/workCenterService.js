const workCenterFactory = require("../factory/workCenterFactory");
const plantFactory = require("../factory/plantFactory");
const db = require("../db/connect_db");
const { departmentSchema } = require("../models/Schema");
const { and, eq } = require("drizzle-orm");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const validatePlantAndDepartment = async (plantId, depId) => {
  const plant = await plantFactory.getPlantById(plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }

  const department = await db.query.departmentSchema.findFirst({
    where: and(
      eq(departmentSchema.id, depId),
      eq(departmentSchema.plantId, plantId),
    ),
  });
  if (!department) {
    throw new Error("Department does not belong to the selected plant");
  }
};

const getWorkCenters = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    plantId: query.plantId ? Number(query.plantId) : undefined,
    depId: query.depId ? Number(query.depId) : undefined,
    search: query.search,
  };

  const workCenters = await workCenterFactory.getWorkCenters(limit, offset, filters);
  const totalCount = await workCenterFactory.getTotalWorkCenters(filters);

  return {
    data: workCenters,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

const getWorkCenterSelections = async (query) => {
  const plantId = query.plantId ? Number(query.plantId) : undefined;
  const depId = query.depId ? Number(query.depId) : undefined;
  const workCenters = await workCenterFactory.getWorkCenterSelections({
    plantId,
    depId,
  });

  return { workCenters };
};

const getWorkCenterById = async (id) => {
  const workCenterId = Number(id);
  const workCenter = await workCenterFactory.getWorkCenterById(workCenterId);

  if (!workCenter) {
    throw new Error("Work center not found");
  }

  return { workCenter };
};

const createWorkCenter = async (body) => {
  if (!body.plantId || !body.depId || !body.workName) {
    throw new Error("plantId, depId and workName are required");
  }

  const plantId = Number(body.plantId);
  const depId = Number(body.depId);

  await validatePlantAndDepartment(plantId, depId);

  return workCenterFactory.createWorkCenter({
    plantId,
    depId,
    workName: body.workName,
    workCode: body.workCode || null,
    workDescription: body.workDescription || null,
  });
};

const updateWorkCenter = async (id, body) => {
  const workCenterId = Number(id);
  const existingWorkCenter = await workCenterFactory.getWorkCenterById(workCenterId);
  if (!existingWorkCenter) {
    throw new Error("Work center not found");
  }

  const nextPlantId = body.plantId
    ? Number(body.plantId)
    : existingWorkCenter.plantId;
  const nextDepId = body.depId ? Number(body.depId) : existingWorkCenter.depId;

  await validatePlantAndDepartment(nextPlantId, nextDepId);

  const payload = { ...body };
  if (payload.plantId) {
    payload.plantId = Number(payload.plantId);
  }
  if (payload.depId) {
    payload.depId = Number(payload.depId);
  }

  return workCenterFactory.updateWorkCenter(workCenterId, payload);
};

const deleteWorkCenter = async (id) => {
  const workCenterId = Number(id);
  const existingWorkCenter = await workCenterFactory.getWorkCenterById(workCenterId);
  if (!existingWorkCenter) {
    throw new Error("Work center not found");
  }

  return workCenterFactory.deleteWorkCenter(workCenterId);
};

module.exports = {
  getWorkCenters,
  getWorkCenterSelections,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
};
