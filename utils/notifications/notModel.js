const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    message: String,
    type: {
      type: String,
      enum: ["CHECK_REMINDER", "REPAIR_DONE", "ADMIN_MESSAGE"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
