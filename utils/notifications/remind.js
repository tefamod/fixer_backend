// notification.cron.js
const cron = require("node-cron");
const Car = require("../../models/Car.js");
const notificationService = require("./notService");

const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("Running car check reminders...");

    const cars = await Car.find({
      nextCheckDate: { $lte: new Date() },
    });

    for (const car of cars) {
      await notificationService.sendNotification({
        userId: car.user,
        title: "Car Check Reminder",
        message: "Your car needs inspection",
        type: "CHECK_REMINDER",
      });
    }
  });
};

module.exports = startCronJobs;
