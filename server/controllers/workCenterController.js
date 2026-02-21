const workCenterService = require("../services/workCenterService");

const getWorkCenterWriteErrorMessage = (err) => {
  if (err?.code !== "23505") {
    return err.message;
  }

  const constraint = (err.constraint || "").toLowerCase();
  const detail = (err.detail || "").toLowerCase();
  if (constraint.includes("work_code") || detail.includes("(work_code)")) {
    return "Work center code already exists";
  }

  return "Duplicate value already exists";
};

const getWorkCenters = async (req, res) => {
  try {
    const result = await workCenterService.getWorkCenters(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWorkCenterSelections = async (req, res) => {
  try {
    const result = await workCenterService.getWorkCenterSelections(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWorkCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await workCenterService.getWorkCenterById(id);
    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.message === "Work center not found" ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

const createWorkCenter = async (req, res) => {
  try {
    await workCenterService.createWorkCenter(req.body);
    res.status(201).json({ message: "Work center added successfully" });
  } catch (err) {
    res.status(400).json({ error: getWorkCenterWriteErrorMessage(err) });
  }
};

const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await workCenterService.updateWorkCenter(id, req.body);
    res.status(200).json({ message: "Work center updated successfully" });
  } catch (err) {
    res.status(400).json({ error: getWorkCenterWriteErrorMessage(err) });
  }
};

const deleteWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await workCenterService.deleteWorkCenter(id);
    res.status(200).json({ message: "Work center deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getWorkCenters,
  getWorkCenterSelections,
  getWorkCenterById,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
};

