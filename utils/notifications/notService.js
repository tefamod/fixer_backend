const Notification = require("./notModel.js");
const { getIO } = require("./socket.js");

exports.sendNotification = async ({ userId, title, message, type }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
  });

  const io = getIO();

  io.to(userId.toString()).emit("notification", notification);

  return notification;
};

// send to multiple users
exports.sendBulkNotifications = async (users, data) => {
  for (const user of users) {
    await exports.sendNotification({
      userId: user._id,
      ...data,
    });
  }
};
