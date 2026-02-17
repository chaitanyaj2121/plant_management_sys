const workCenterService = require("../services/workCenterService");

const getWorkCenters = async (req, res) => {
  try {
    const result = await workCenterService.getWorkCenters(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createWorkCenter = async (req, res) => {
  try {
    await workCenterService.createWorkCenter(req.body);
    res.status(201).json({ message: "Work center added successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateWorkCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await workCenterService.updateWorkCenter(id, req.body);
    res.status(200).json({ message: "Work center updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
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

const getWorkCenterAssignmentData = async (req, res) => {
  try {
    const result = await workCenterService.getWorkCenterAssignmentData(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getWorkCenters,
  createWorkCenter,
  updateWorkCenter,
  deleteWorkCenter,
  getWorkCenterAssignmentData,
};

