const express = require("express");
const router = express.Router();

const { getHomepram, cahngeUserPhoto } = require("../services/homeService");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const { UpdateUserImage } = require("../middlewares/uploadImageCloud");
router.route("/:carNumber").get(getHomepram);
router
  .route("/changeImage/:id")
  .put(uploadSingleImage("image"), UpdateUserImage, cahngeUserPhoto);
module.exports = router;
