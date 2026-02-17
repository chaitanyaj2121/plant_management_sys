const express = require("express");
const departmentController = require("../controllers/departmentController");

const router = express.Router();

router.get("/assignment-data", departmentController.getDepartmentAssignmentData);
router.get("/", departmentController.getDepartments);
router.post("/", departmentController.createDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;

