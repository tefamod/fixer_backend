const express = require("express");
const router = express.Router();

const {
  addCar,
  getCars,
  getRepairingCars,
  makeCarInRepair,
  searchForallCars,
  searchForRepairingCars,
  updateCar,
  getCar,
  deleteCar,
  getUniqueBrands,
} = require("../services/GarageServices");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  processCarImage,
  updateCarImage,
} = require("../middlewares/uploadImageCloud");

router.route("/").get(getCars);
router
  .route("/updateCarsImageInDB")
  .post(uploadSingleImage("image"), processCarImage);
router.route("/getCar/:id").get(getCar);
router.route("/add/:id").post(addCar);
router.route("/repairing").get(getRepairingCars);
router.route("/:carNumber").put(makeCarInRepair);
router.route("/search/:searchString").get(searchForallCars);
router.route("/search/repairing/:searchString").get(searchForRepairingCars);
router
  .route("/update/:id")
  .put(uploadSingleImage("image"), updateCarImage, updateCar);
router.route("/delete/:id").delete(deleteCar);
router.route("/getCarsInDB/").get(getUniqueBrands);

module.exports = router;
