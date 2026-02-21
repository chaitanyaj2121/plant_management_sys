const costCenterFactory = require("../factory/costCenterFactory");
const plantFactory = require("../factory/plantFactory");
const db = require("../db/connect_db");
const { departmentSchema, workCenterSchema } = require("../models/Schema");
const { and, eq, inArray } = require("drizzle-orm");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const normalizeIds = (ids) => {
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.map((id) => Number(id)).filter((id) => Number.isInteger(id));
};

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


const getCostCenters = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    plantId: query.plantId,
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

  const plantId = body.plantId;
  const depId = Number(body.depId);
  const workCenterIds = normalizeIds(body.workCenterIds);

  await validatePlantAndDepartment(plantId, depId);

  const createdCostCenter = await costCenterFactory.createCostCenter({
    plantId,
    depId,
    costCenterName: body.costCenterName,
    costCenterCode: body.costCenterCode || null,
    description: body.description || null,
  });

  if (workCenterIds.length > 0) {
    await assignWorkCentersDirect(workCenterIds, createdCostCenter.id);
  }

  return createdCostCenter;
};

const updateCostCenter = async (id, body) => {
  const costCenterId = Number(id);
  const existingCostCenter = await costCenterFactory.getCostCenterById(costCenterId);
  if (!existingCostCenter) {
    throw new Error("Cost center not found");
  }

  const nextPlantId = body.plantId || existingCostCenter.plantId;
  const nextDepId = body.depId ? Number(body.depId) : existingCostCenter.depId;
  const workCenterIds = body.workCenterIds
    ? normalizeIds(body.workCenterIds)
    : undefined;

  await validatePlantAndDepartment(nextPlantId, nextDepId);

  const payload = { ...body };
  if (payload.depId) {
    payload.depId = Number(payload.depId);
  }
  delete payload.workCenterIds;

  await costCenterFactory.updateCostCenter(costCenterId, payload);

  if (workCenterIds) {
    await assignWorkCentersDirect(workCenterIds, costCenterId);
    await clearRemovedWorkCentersDirect(costCenterId, workCenterIds);
  }
};

const deleteCostCenter = async (id) => {
  const costCenterId = Number(id);
  const existingCostCenter = await costCenterFactory.getCostCenterById(costCenterId);
  if (!existingCostCenter) {
    throw new Error("Cost center not found");
  }

  return costCenterFactory.deleteCostCenter(costCenterId);
};

const assignWorkCentersDirect = async (workCenterIds, costCenterId) => {
  if (!workCenterIds || workCenterIds.length === 0) {
    return;
  }

  await db
    .update(workCenterSchema)
    .set({ costCenterId })
    .where(inArray(workCenterSchema.id, workCenterIds));
};

const clearRemovedWorkCentersDirect = async (costCenterId, keepIds = []) => {
  const existing = await db
    .select({ id: workCenterSchema.id })
    .from(workCenterSchema)
    .where(eq(workCenterSchema.costCenterId, costCenterId));

  const existingIds = existing.map((row) => row.id);
  const toClear = existingIds.filter((id) => !keepIds.includes(id));

  if (toClear.length === 0) {
    return;
  }

  await db
    .update(workCenterSchema)
    .set({ costCenterId: null })
    .where(inArray(workCenterSchema.id, toClear));
};

module.exports = {
  getCostCenters,
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
};
