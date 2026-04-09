// notification.controller.js
const asyncHandler = require("express-async-handler");
const Notification = require("./notModel.js");
const notificationService = require("./notService.js");
const User = require("../../models/userModel.js");
const apiError = require("../apiError");

// Get user notifications
exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
  }).sort("-createdAt");

  res.json({ results: notifications.length, data: notifications });
});

// Mark as read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true },
  );

  res.json(notification);
});

// Admin send notification
exports.sendNotforAll = asyncHandler(async (req, res, next) => {
  const { selectedUsers, title, message } = req.body;

  // ✅ خلى الأدمن من التوكن مش من params
  const admin = await User.findById(req.user._id);

  if (!admin) {
    return next(new apiError(`Admin not found`, 400));
  }

  if (admin.role !== "admin") {
    return next(new apiError(`Only admin can send notifications`, 403));
  }

  let users;

  // ✅ لو مفيش users مختارين → ابعت لكل الناس
  if (!selectedUsers || selectedUsers.length === 0) {
    users = await User.find();
  } else {
    // ✅ هات users من الـ IDs
    users = await User.find({
      _id: { $in: selectedUsers },
    });
  }

  await notificationService.sendBulkNotifications(users, {
    title,
    message,
    type: "ADMIN_MESSAGE",
  });

  res.status(200).json({
    message: "Notifications sent successfully",
    count: users.length,
  });
});
