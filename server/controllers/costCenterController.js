const costCenterService = require("../services/costCenterService");

const getCostCenterWriteErrorMessage = (err) => {
  if (err?.code !== "23505") {
    return err.message;
  }

  const constraint = (err.constraint || "").toLowerCase();
  const detail = (err.detail || "").toLowerCase();
  if (
    constraint.includes("cost_center_code") ||
    detail.includes("(cost_center_code)")
  ) {
    return "Cost center code already exists";
  }

  return "Duplicate value already exists";
};

const getCostCenters = async (req, res) => {
  try {
    const result = await costCenterService.getCostCenters(req.query);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCostCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await costCenterService.getCostCenterById(id);
    res.status(200).json(result);
  } catch (err) {
    const statusCode = err.message === "Cost center not found" ? 404 : 400;
    res.status(statusCode).json({ error: err.message });
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
    res.status(400).json({ error: getCostCenterWriteErrorMessage(err) });
  }
};

const updateCostCenter = async (req, res) => {
  try {
    const { id } = req.params;
    await costCenterService.updateCostCenter(id, req.body);
    return res.status(200).json({ message: "Cost center updated successfully" });
  } catch (err) {
    res.status(400).json({ error: getCostCenterWriteErrorMessage(err) });
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
  getCostCenterById,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
};
