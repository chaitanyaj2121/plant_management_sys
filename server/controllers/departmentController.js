const departmentService = require("../services/departmentService");

const getDepartmentWriteErrorMessage = (err) => {
  if (err?.code !== "23505") {
    return err.message;
  }

  const constraint = (err.constraint || "").toLowerCase();
  const detail = (err.detail || "").toLowerCase();
  if (constraint.includes("dep_code") || detail.includes("(dep_code)")) {
    return "Department code already exists";
  }

  return "Duplicate value already exists";
};

const getDepartments = async (req, res) => {
  try {
    const result = await departmentService.getDepartments(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDepartmentSelections = async (req, res) => {
  try {
    const result = await departmentService.getDepartmentSelections(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await departmentService.getDepartmentById(id);
    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.message === "Department not found" ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    await departmentService.createDepartment(req.body);
    res.status(201).json({ message: "Department added successfully" });
  } catch (err) {
    res.status(400).json({ error: getDepartmentWriteErrorMessage(err) });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await departmentService.updateDepartment(id, req.body);
    res.status(200).json({ message: "Department updated successfully" });
  } catch (err) {
    res.status(400).json({ error: getDepartmentWriteErrorMessage(err) });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await departmentService.deleteDepartment(id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getDepartments,
  getDepartmentSelections,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

