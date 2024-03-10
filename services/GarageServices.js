const Car = require("../models/Car");
//const slugify = require("slugify");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

// @desc add car
// @Route GET /api/v1/Garage
// @access private\
exports.addCar = factory.addOne(Car);

// @desc Search for a car by car number
// @Route GET /api/v1/Garage/:carNumber
// @access private
exports.searchCarByNumber = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;

  // Assuming carNumber is a unique identifier in your Car model
  const car = await Car.findOne({ carNumber });

  if (!car) {
    return next(new apiError(`Can't find product for this id ${id}`, 404));
  }

  res.status(201).json({ data: car });
});

// @desc Get list of all Cars
// @Route GET /api/v1/Garage
// @access public
exports.getCars = factory.getAll(Car);
//exports.getCars = asyncHandler(async (req, res) => {
//  const page = req.query.page * 1 || 1;
//  const limit = req.query.limit * 1 || 5;
//  const skip = (page - 1) * limit;

// const cars = await Car.find({}).skip(skip).limit(limit);
//  res.status(200).json({ result: cars.length, page, data: cars });
//});

// @desc Get list of repairing Cars
// @Route GET /api/v1/Garage/repairing
// @access public
exports.getRepairingCars = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  const repairingCars = await Car.find({ repairing: true })
    .skip(skip)
    .limit(limit);

  res
    .status(200)
    .json({ result: repairingCars.length, page, data: repairingCars });
});

// @desc Search for a car by car number
// @Route GET /api/v1/Garage/:carNumber
// @access private
exports.makeCarInRepair = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;
  const { repairing } = req.body;

  if (repairing == undefined || repairing == null) {
    return next(new apiError(`must make value for repairing`, 400));
  }

  const car = await Car.findOneAndUpdate(
    { carNumber },
    { repairing },
    { new: true }
  );

  if (!car) {
    return next(new apiError(`Can't find product for this id ${id}`, 404));
  }

  res.status(200).json({ data: car });
});

// @desc upadete spacific car
// @Route PUT /api/v1/Garage/:id
// @access private
exports.updateCar = factory.updateOne(Car);
