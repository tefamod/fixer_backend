const express = require("express");
const router = express.Router();

const {
  UpdateWorkerDetals,
  addWorker,
  getAllWorkers,
  getWorker,
  UpdateWorkerDetalsByNID,
  deleteWorker,
  moneyFromToworker,
} = require("../services/WorksServices");

const {
  addWorkerValidator,
} = require("../utils/validator/phoneNumberValidator");
router.route("/").get(getAllWorkers).post(addWorkerValidator, addWorker);
router.route("/:id").delete(deleteWorker).post(moneyFromToworker);
router.route("/search/:searchString").get(getWorker);
router.route("/withoutNID/:id").put(UpdateWorkerDetals);
router.route("/:IdNumber").put(UpdateWorkerDetalsByNID);

module.exports = router;
