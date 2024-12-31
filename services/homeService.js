const Inventory = require("../models/Inventory");
const Repairing = require("../models/repairingModel");
const Car = require("../models/Car");
//const slugify = require("slugify");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");

// @desc get home prams by car Number
// @Route GET /api/v1/Home/:carNumber
// @access private
exports.getHomepram = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;

  const car = await Car.findOne({ carNumber });

  if (!car) {
    return next(
      new apiError(`Can't find car for this car number ${carNumber}`, 404)
    );
  }

  const repairing = await Repairing.findById(car.repairing_id);

  if (!repairing) {
    console.log("i`m here");
    const defaultRepairData = {
      createdDate: "-/-/-",
      expectedDate: "-/-/-",
      completedServicesRatio: 0,
      state: car.State,
      lastRepairDate: car.lastRepairDate || "-/-/-",
      nextRepairDate: car.nextRepairDate || "-/-/-",
      periodicRepairs: car.periodicRepairs || 0,
      nonperiodicRepairs: car.nonPeriodicRepairs || 0,
    };

    if (!car.nextRepairDate && !car.lastRepairDate) {
      console.log("Repairing and dates are not available.");
      return res.status(200).json({ data: defaultRepairData });
    }

    return res.status(200).json({ data: defaultRepairData });
  }

  return res.status(200).json({
    data: {
      createdDate: repairing.createdAt || "-/-/-",
      expectedDate: repairing.expectedDate || "-/-/-",
      completedServicesRatio: repairing.completedServicesRatio || 0,
      state: car.State,
      lastRepairDate: car.lastRepairDate || "-/-/-",
      nextRepairDate: car.nextRepairDate || "-/-/-",
      periodicRepairs: car.periodicRepairs || 0,
      nonperiodicRepairs: car.nonPeriodicRepairs || 0,
      nextRepairDistance: car.nextRepairDistance || "-/-/-",
    },
  });
});
