const express = require("express");
const router = express.Router();

const {
  saveFCMToken,
  sendNotificationToUser,
  sendNotificationToAllUsers,
} = require("../services/notificationFire");
const authService = require("../services/authService");

router.use(authService.protect);

router.use(authService.allowedTo("admin"));

router.route("/saveFCMToken/:userId").post(saveFCMToken);
router.route("/send/:id").post(sendNotificationToUser);
router.route("/notificationSendAll/").post(sendNotificationToAllUsers);
module.exports = router;
