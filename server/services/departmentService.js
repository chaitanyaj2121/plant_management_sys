const departmentFactory = require("../factory/departmentFactory");
const plantFactory = require("../factory/plantFactory");
const {
  parsePagination,
  buildPaginationMeta,
} = require("../factory/paginationFactory");

const getDepartments = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const plantId = query.plantId;

  const departments = await departmentFactory.getDepartments(limit, offset, plantId);
  const totalCount = await departmentFactory.getTotalDepartments(plantId);

  return {
    data: departments,
    pagination: buildPaginationMeta(totalCount, page, limit),
  };
};

const createDepartment = async (body) => {
  if (!body.plantId || !body.depName) {
    throw new Error("plantId and depName are required");
  }

  const plant = await plantFactory.getPlantById(body.plantId);
  if (!plant) {
    throw new Error("Plant not found");
  }

  return departmentFactory.createDepartment({
    plantId: body.plantId,
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
    const plant = await plantFactory.getPlantById(body.plantId);
    if (!plant) {
      throw new Error("Plant not found");
    }
  }

  return departmentFactory.updateDepartment(departmentId, body);
};

const deleteDepartment = async (id) => {
  const departmentId = Number(id);
  const existingDepartment = await departmentFactory.getDepartmentById(departmentId);
  if (!existingDepartment) {
    throw new Error("Department not found");
  }

  return departmentFactory.deleteDepartment(departmentId);
};

const getDepartmentAssignmentData = async () => {
  const plants = await plantFactory.getPlantSelections();
  return { plants };
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentAssignmentData,
};
