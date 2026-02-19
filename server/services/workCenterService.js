const workCenterFactory = require("../factory/workCenterFactory");
const plantFactory = require("../factory/plantFactory");
const departmentFactory = require("../factory/departmentFactory");
const costCenterFactory = require("../factory/costCenterFactory");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const validatePlantAndDepartment = async (plantId, depId) => {
  const plant = await plantFactory.getPlantById(plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }

  const department = await departmentFactory.getDepartmentByIdAndPlantId(depId, plantId);
  if (!department) {
    throw new Error("Department does not belong to the selected plant");
  }
};

const validateCostCenter = async (costCenterId, plantId, depId) => {
  if (!costCenterId) {
    return;
  }

  const costCenter = await costCenterFactory.getCostCenterById(Number(costCenterId));
  if (!costCenter) {
    throw new Error("Cost center not found");
  }

  if (costCenter.plantId !== plantId || costCenter.depId !== depId) {
    throw new Error("Cost center must belong to the same plant and department");
  }
};

const getWorkCenters = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    plantId: query.plantId,
    depId: query.depId ? Number(query.depId) : undefined,
    costCenterId: query.costCenterId ? Number(query.costCenterId) : undefined,
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
  const plantId = query.plantId;
  const depId = query.depId ? Number(query.depId) : undefined;
  const workCenters = await workCenterFactory.getWorkCenterSelections({
    plantId,
    depId,
  });

  return { workCenters };
};

const createWorkCenter = async (body) => {
  if (!body.plantId || !body.depId || !body.workName) {
    throw new Error("plantId, depId and workName are required");
  }

  const plantId = body.plantId;
  const depId = Number(body.depId);
  const costCenterId = body.costCenterId ? Number(body.costCenterId) : null;

  await validatePlantAndDepartment(plantId, depId);
  await validateCostCenter(costCenterId, plantId, depId);

  return workCenterFactory.createWorkCenter({
    plantId,
    depId,
    costCenterId,
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

  const nextPlantId = body.plantId || existingWorkCenter.plantId;
  const nextDepId = body.depId ? Number(body.depId) : existingWorkCenter.depId;
  const nextCostCenterId =
    body.costCenterId !== undefined
      ? body.costCenterId
        ? Number(body.costCenterId)
        : null
      : existingWorkCenter.costCenterId;

  await validatePlantAndDepartment(nextPlantId, nextDepId);
  await validateCostCenter(nextCostCenterId, nextPlantId, nextDepId);

  const payload = { ...body };
  if (payload.depId) {
    payload.depId = Number(payload.depId);
  }
  if (payload.costCenterId !== undefined) {
    payload.costCenterId = payload.costCenterId ? Number(payload.costCenterId) : null;
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
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
};
