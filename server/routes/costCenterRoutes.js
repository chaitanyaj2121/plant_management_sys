const express = require("express");
const costCenterController = require("../controllers/costCenterController");

const router = express.Router();

router.get("/assignment-data", costCenterController.getCostCenterAssignmentData);
router.get("/", costCenterController.getCostCenters);
router.post("/", costCenterController.createCostCenter);
router.put("/:id", costCenterController.updateCostCenter);
router.delete("/:id", costCenterController.deleteCostCenter);

module.exports = router;

