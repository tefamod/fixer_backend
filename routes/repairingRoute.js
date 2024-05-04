const express = require("express");
const router = express.Router();

const {
  createRepairing,
  getCarRepairsByNumber,
  updateServiceStateById,
  getAllComRepairs,
  getCarRepairsByid,
  getCarRepairsByGenCode,
} = require("../services/repairingService");

router.route("/").post(createRepairing).get(getAllComRepairs);
router.route("/:carNumber").get(getCarRepairsByNumber);
router.route("/getById/:id").get(getCarRepairsByid);
router.route("/gen/:generatedCode").get(getCarRepairsByGenCode);
router.route("/:serviceId").put(updateServiceStateById);
module.exports = router;
