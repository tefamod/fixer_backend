const express = require("express");
const router = express.Router();

const {
  createReport,
  getAllReports,
  getThreePramsForSpecMon,
  addorSubthing,
  getmonthWork,
} = require("../services/moneyReportServices");

router.route("/").get(getAllReports).post(createReport);
router.route("/specific_month_year/:year_month").get(getThreePramsForSpecMon);
router.route("/addthing/").post(addorSubthing);
router.route("/home/work/:year_month").get(getmonthWork);
module.exports = router;
