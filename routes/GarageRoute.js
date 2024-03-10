const express = require("express");
const router = express.Router();

const {
  addCar,
  getCars,
  getRepairingCars,
  makeCarInRepair,
  searchCarByNumber,
  updateCar,
} = require("../services/GarageServices");

router.route("/").get(getCars).post(addCar);
router.route("/repairing").get(getRepairingCars);
router.route("/:carNumber").put(makeCarInRepair).get(searchCarByNumber);
router.route("/update/:id").put(updateCar);

module.exports = router;
