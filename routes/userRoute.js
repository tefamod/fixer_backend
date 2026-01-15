const express = require("express");
const {
  getUserValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserValidator,
} = require("../utils/validator/userValidator");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  makeUserUnactive,
  uploadUserImage,
  changeUserPassword,
  searchForUser,
  suggestNextCodeNumber,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUserData,
} = require("../services/userService");
const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");
const {
  processUserImage,
  UpdateUserImage,
} = require("../middlewares/uploadImageCloud");

const authService = require("../services/authService");

const router = express.Router();

router.use(authService.protect);

//router.get("/getMe", getLoggedUserData, getUser);
//router.put("/changeMyPassword", updateLoggedUserPassword);
//router.put("/updateMe", updateLoggedUserValidator, updateLoggedUserData);
//router.delete("/deleteMe", deleteLoggedUserData);

// Admin
router.use(authService.allowedTo("admin"));
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword
);
router
  .route("/")
  .get(getUsers)
  .post(uploadSingleImage("image"), processUserImage, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    uploadSingleImage("image"),
    UpdateUserImage,
    updateUserValidator,
    updateUser
  );
router.route("/active/:id").put(makeUserUnactive);
router.route("/search/:searchString").get(searchForUser);
router.route("/carCode/:clientType").get(suggestNextCodeNumber);

module.exports = router;
