const express = require("express");
const router = express.Router();

const { getCarImage, getNextCarImage } = require("../services/findCarImage");
router.route("/").post(getCarImage);
router.route("/next").post(getNextCarImage);
module.exports = router;
