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

  try {
    const car = await Car.findOne({ carNumber });

    if (!car) {
      return next(
        new apiError(`Can't find car for this car number ${carNumber}`, 404)
      );
    }
    // Assuming carNumber is a unique identifier in your Car model
    const repairing = await Repairing.findById(car.repairing_id);

    if (!repairing) {
      return next(
        new apiError(
          `Can't find services for this car number ${carNumber}`,
          404
        )
      );
    }
    // Map each repairing object to a modified object with only specific fields
    /*    const modifiedRepairing = repairing.map((repair) => ({
      createdDate: repair.createdAt,
      complete: repair.complete,
      expectedDate: repair.expectedDate,
      completedServicesRatio: repair.completedServicesRatio,
      state: repair.state,
      lastRepairDate: car.lastRepairDate,
      nextRepairDate: car.nextRepairDate,
      periodicRepairs: car.periodicRepairs,
      nonperiodicRepairs: car.nonPeriodicRepairs,
    }));*/
    res.status(200).json({
      data: {
        createdDate: repairing.createdAt,
        expectedDate: repairing.expectedDate,
        completedServicesRatio: repairing.completedServicesRatio,
        state: car.State,
        lastRepairDate: car.lastRepairDate,
        nextRepairDate: car.nextRepairDate,
        periodicRepairs: car.periodicRepairs,
        nonperiodicRepairs: car.nonPeriodicRepairs,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    next(new apiError("Internal Server Error", 500));
  }
});
