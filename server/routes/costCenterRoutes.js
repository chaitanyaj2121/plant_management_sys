const express = require("express");
const costCenterController = require("../controllers/costCenterController");

const router = express.Router();

router.get("/", costCenterController.getCostCenters);
router.get("/:id", costCenterController.getCostCenterById);
router.post("/", costCenterController.createCostCenter);
router.put("/:id", costCenterController.updateCostCenter);
router.delete("/:id", costCenterController.deleteCostCenter);

module.exports = router;

