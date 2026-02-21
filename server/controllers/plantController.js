const plantService = require("../services/plantService");

const getPlantWriteErrorMessage = (err) => {
  if (err?.code !== "23505") {
    return err.message;
  }

  const constraint = (err.constraint || "").toLowerCase();
  const detail = (err.detail || "").toLowerCase();
  if (constraint.includes("code") || detail.includes("(code)")) {
    return "Plant code already exists";
  }

  return "Duplicate value already exists";
};

const getPlants = async (req, res) => {
  try {
    const result = await plantService.getPlants(req.query);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlantSelections = async (req, res) => {
  try {
    const result = await plantService.getPlantSelections();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await plantService.getPlantById(id);
    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.message === "Plant not found" ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
  }
};

const createPlant = async (req, res) => {
  try {
    await plantService.createPlant(req.body);
    res.status(201).json({ message: "Plant added successfully" });
  } catch (err) {
    res.status(400).json({ error: getPlantWriteErrorMessage(err) });
  }
};

const updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    await plantService.updatePlant(id, req.body);
    res.json({ message: "Plant updated successfully" });
  } catch (err) {
    res.status(400).json({ error: getPlantWriteErrorMessage(err) });
  }
};

const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    await plantService.deletePlant(id);
    res.json({ message: "Plant deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getPlants,
  getPlantSelections,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
};
