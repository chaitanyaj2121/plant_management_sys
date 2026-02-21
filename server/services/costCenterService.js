const costCenterFactory = require("../factory/costCenterFactory");
const plantFactory = require("../factory/plantFactory");
const db = require("../db/connect_db");
const { departmentSchema, workCenterSchema } = require("../models/Schema");
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

const validateWorkCenter = async (workCenterId, plantId, depId) => {
  if (!workCenterId) {
    return;
  }

  const workCenter = await db.query.workCenterSchema.findFirst({
    where: and(
      eq(workCenterSchema.id, workCenterId),
      eq(workCenterSchema.plantId, plantId),
      eq(workCenterSchema.depId, depId),
    ),
  });

  if (!workCenter) {
    throw new Error("Work center must belong to the selected plant and department");
  }
};

const getCostCenters = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    plantId: query.plantId ? Number(query.plantId) : undefined,
    depId: query.depId ? Number(query.depId) : undefined,
    search: query.search,
  };

  const costCenters = await costCenterFactory.getCostCenters(limit, offset, filters);
  const totalCount = await costCenterFactory.getTotalCostCenters(filters);

  return {
    data: costCenters,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

const getCostCenterById = async (id) => {
  const costCenterId = Number(id);
  const costCenter = await costCenterFactory.getCostCenterById(costCenterId);

  if (!costCenter) {
    throw new Error("Cost center not found");
  }

  return { costCenter };
};

const createCostCenter = async (body) => {
  if (!body.plantId || !body.depId || !body.costCenterName) {
    throw new Error("plantId, depId and costCenterName are required");
  }

  const plantId = Number(body.plantId);
  const depId = Number(body.depId);
  const workCenterId = body.workCenterId ? Number(body.workCenterId) : null;

  await validatePlantAndDepartment(plantId, depId);
  await validateWorkCenter(workCenterId, plantId, depId);

  const createdCostCenter = await costCenterFactory.createCostCenter({
    plantId,
    depId,
    workCenterId,
    costCenterName: body.costCenterName,
    costCenterCode: body.costCenterCode || null,
    description: body.description || null,
  });

  return createdCostCenter;
};

const updateCostCenter = async (id, body) => {
  const costCenterId = Number(id);
  const existingCostCenter = await costCenterFactory.getCostCenterById(costCenterId);
  if (!existingCostCenter) {
    throw new Error("Cost center not found");
  }

  const nextPlantId = body.plantId
    ? Number(body.plantId)
    : existingCostCenter.plantId;
  const nextDepId = body.depId ? Number(body.depId) : existingCostCenter.depId;
  const nextWorkCenterId = body.workCenterId
    ? Number(body.workCenterId)
    : body.workCenterId === null || body.workCenterId === ""
      ? null
      : existingCostCenter.workCenterId;

  await validatePlantAndDepartment(nextPlantId, nextDepId);
  await validateWorkCenter(nextWorkCenterId, nextPlantId, nextDepId);

  const payload = { ...body };
  if (payload.plantId) {
    payload.plantId = Number(payload.plantId);
  }
  if (payload.depId) {
    payload.depId = Number(payload.depId);
  }
  if (payload.workCenterId !== undefined) {
    payload.workCenterId = payload.workCenterId
      ? Number(payload.workCenterId)
      : null;
  }

  await costCenterFactory.updateCostCenter(costCenterId, payload);
};

const deleteCostCenter = async (id) => {
  const costCenterId = Number(id);
  const existingCostCenter = await costCenterFactory.getCostCenterById(costCenterId);
  if (!existingCostCenter) {
    throw new Error("Cost center not found");
  }

  return costCenterFactory.deleteCostCenter(costCenterId);
};

module.exports = {
  getCostCenters,
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
};
