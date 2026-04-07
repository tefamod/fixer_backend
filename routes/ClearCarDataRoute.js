const express = require("express");
const router = express.Router();

const {
  cleanBrands,
  cleanCategories,
  getAllBrands,
  getAllCategory,
} = require("../services/clean_car_data");

router.route("/brands").get(getAllBrands).put(cleanBrands);
router.route("/categories").get(getAllCategory).put(cleanCategories);
module.exports = router;
