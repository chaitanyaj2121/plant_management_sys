const express = require("express");
const workCenterController = require("../controllers/workCenterController");

const router = express.Router();

router.get("/", workCenterController.getWorkCenters);
router.get("/selections", workCenterController.getWorkCenterSelections);
router.post("/", workCenterController.createWorkCenter);
router.put("/:id", workCenterController.updateWorkCenter);
router.delete("/:id", workCenterController.deleteWorkCenter);

module.exports = router;

