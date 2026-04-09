// notification.routes.js
const express = require("express");
const controller = require("./notController.js");

const router = express.Router();
router.get("/", controller.getMyNotifications);
router.post("/sendAll/:id", controller.sendNotforAll);
router.patch("/:id/read", controller.markAsRead);
//router.post("/send", controller.sendNotification);

module.exports = router;
