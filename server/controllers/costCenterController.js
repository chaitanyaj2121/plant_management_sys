const costCenterService = require("../services/costCenterService");

const getCostCenters = async (req, res) => {
  try {
    const result = await costCenterService.getCostCenters(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createCostCenter = async (req, res) => {
  try {
    const createdCostCenter = await costCenterService.createCostCenter(
      req.body,
    );
    return res.status(201).json({
      message: "Cost center added successfully",
      costCenterId: createdCostCenter.id,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await costCenterService.updateCostCenter(id, req.body);
    return res.status(200).json({ message: "Cost center updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await costCenterService.deleteCostCenter(id);
    return res.status(200).json({ message: "Cost center deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
};
