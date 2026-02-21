const departmentFactory = require("../factory/departmentFactory");
const plantFactory = require("../factory/plantFactory");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const getDepartments = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const filters = {
    plantId: query.plantId ? Number(query.plantId) : undefined,
    search: query.search,
  };

  const departments = await departmentFactory.getDepartments(limit, offset, filters);
  const totalCount = await departmentFactory.getTotalDepartments(filters);

  return {
    data: departments,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

const getDepartmentSelections = async (query) => {
  const plantId = query.plantId ? Number(query.plantId) : undefined;
  const departments = await departmentFactory.getDepartmentSelections(plantId);
  return { departments };
};

const getDepartmentById = async (id) => {
  const departmentId = Number(id);
  const department = await departmentFactory.getDepartmentById(departmentId);

  if (!department) {
    throw new Error("Department not found");
  }

  return { department };
};

const createDepartment = async (body) => {
  if (!body.plantId || !body.depName) {
    throw new Error("plantId and depName are required");
  }

  const plantId = Number(body.plantId);
  const plant = await plantFactory.getPlantById(plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }

  return departmentFactory.createDepartment({
    plantId,
    depName: body.depName,
    depCode: body.depCode || null,
    depDescription: body.depDescription || null,
  });
};

const updateDepartment = async (id, body) => {
  const departmentId = Number(id);
  const existingDepartment = await departmentFactory.getDepartmentById(departmentId);
  if (!existingDepartment) {
    throw new Error("Department not found");
  }

  if (body.plantId) {
    const plant = await plantFactory.getPlantById(Number(body.plantId));
    if (!plant) {
      throw new Error("Plant not found");
    }
  }

  const payload = { ...body };
  if (payload.plantId) {
    payload.plantId = Number(payload.plantId);
  }

  return departmentFactory.updateDepartment(departmentId, payload);
};

const deleteDepartment = async (id) => {
  const departmentId = Number(id);
  const existingDepartment = await departmentFactory.getDepartmentById(departmentId);
  if (!existingDepartment) {
    throw new Error("Department not found");
  }

  return departmentFactory.deleteDepartment(departmentId);
};

module.exports = {
  getDepartments,
  getDepartmentSelections,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
