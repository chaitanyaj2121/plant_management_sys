const costCenterFactory = require("../factory/costCenterFactory");
const departmentFactory = require("../factory/departmentFactory");
const plantFactory = require("../factory/plantFactory");
const workCenterFactory = require("../factory/workCenterFactory");
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

  const department = await departmentFactory.getDepartmentByIdAndPlantId(depId, plantId);
  if (!department) {
    throw new Error("Department does not belong to the selected plant");
  }
};

const validateWorkCenterAssignments = async (workCenterIds, plantId, depId) => {
  if (workCenterIds.length === 0) {
    return [];
  }

  const workCenters = await costCenterFactory.getWorkCentersByIds(workCenterIds);
  if (workCenters.length !== workCenterIds.length) {
    throw new Error("Some work centers were not found");
  }

  const hasMismatch = workCenters.some(
    (workCenter) => workCenter.plantId !== plantId || workCenter.depId !== depId
  );

  if (hasMismatch) {
    throw new Error(
      "Work centers must belong to the same selected plant and department"
    );
  }

  return workCenters;
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

const createCostCenter = async (body) => {
  if (!body.plantId || !body.depId || !body.costCenterName) {
    throw new Error("plantId, depId and costCenterName are required");
  }

  const plantId = body.plantId;
  const depId = Number(body.depId);
  const workCenterIds = normalizeIds(body.workCenterIds);

  await validatePlantAndDepartment(plantId, depId);
  await validateWorkCenterAssignments(workCenterIds, plantId, depId);

  const createdCostCenter = await costCenterFactory.createCostCenter({
    plantId,
    depId,
    costCenterName: body.costCenterName,
    costCenterCode: body.costCenterCode || null,
    description: body.description || null,
  });

  if (workCenterIds.length > 0) {
    await costCenterFactory.assignCostCenterToWorkCenters(
      workCenterIds,
      createdCostCenter.id
    );
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

  if (workCenterIds) {
    await validateWorkCenterAssignments(workCenterIds, nextPlantId, nextDepId);
  }

  const payload = { ...body };
  if (payload.depId) {
    payload.depId = Number(payload.depId);
  }
  delete payload.workCenterIds;

  await costCenterFactory.updateCostCenter(costCenterId, payload);

  if (workCenterIds) {
    await costCenterFactory.assignCostCenterToWorkCenters(workCenterIds, costCenterId);
    await costCenterFactory.removeCostCenterFromWorkCenters(costCenterId, workCenterIds);
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

const getCostCenterAssignmentData = async (query) => {
  const plantId = query.plantId;
  const depId = query.depId ? Number(query.depId) : undefined;

  const plants = await plantFactory.getPlantSelections();
  const departments = await departmentFactory.getDepartmentSelections(plantId);
  const workCenters = await workCenterFactory.getWorkCenterSelections({ plantId, depId });

  return {
    plants,
    departments,
    workCenters,
  };
};

const getCostCenterPlantSelections = async () => {
  const plants = await plantFactory.getPlantSelections();
  return { plants };
};

const getCostCenterDepartmentSelections = async (query) => {
  const plantId = query.plantId;
  const departments = await departmentFactory.getDepartmentSelections(plantId);
  return { departments };
};

const getCostCenterWorkCenterSelections = async (query) => {
  const plantId = query.plantId;
  const depId = query.depId ? Number(query.depId) : undefined;
  const workCenters = await workCenterFactory.getWorkCenterSelections({ plantId, depId });
  return { workCenters };
};

module.exports = {
  getCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getCostCenterAssignmentData,
  getCostCenterPlantSelections,
  getCostCenterDepartmentSelections,
  getCostCenterWorkCenterSelections,
};
