const Car = require("../models/Car");
const Repairing = require("../models/repairingModel");
const User = require("../models/userModel");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiFeatures = require("../utils/apiFeatures");
const CategoryCode = require("../models/categoryCode");
const searchService = require("./searchService");

// @desc    Add car
// @route   POST /api/v1/Garage/:id
// @access  Private
exports.addCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    carNumber,
    chassisNumber,
    color,
    brand,
    category,
    model,
    nextRepairDate,
    lastRepairDate,
    periodicRepairs,
    nonPeriodicRepairs,
    distances,
    motorNumber,
    clientType,
    manually,
  } = req.body;

  // Check duplicate carNumber
  const existingCar = await Car.findOne({ carNumber });
  if (existingCar) {
    return next(
      new apiError(
        `There is already a car with the same car number ${carNumber}`,
        400,
      ),
    );
  }

  // Check duplicate chassisNumber
  if (chassisNumber) {
    const existingCarWithChassis = await Car.findOne({ chassisNumber });
    if (existingCarWithChassis) {
      return next(
        new apiError(
          `There is already a car with the same chassis number ${chassisNumber}`,
          400,
        ),
      );
    }
  }

  // Check duplicate motorNumber
  if (motorNumber) {
    const existingCarWithMotor = await Car.findOne({ motorNumber });
    if (existingCarWithMotor) {
      return next(
        new apiError(
          `There is already a car with the same motor number ${motorNumber}`,
          400,
        ),
      );
    }
  }

  // Generate car code
  const categoryCode = await CategoryCode.findOne({ category: clientType });
  if (!categoryCode) {
    return next(
      new apiError(`There is no type with this name ${clientType}`, 400),
    );
  }

  let newCarCode;
  if (manually === "True" || manually === "true") {
    const carCode = req.body.carCode;
    const parsedCarCode = parseInt(carCode, 10);
    if (isNaN(parsedCarCode) || !Number.isInteger(parsedCarCode)) {
      return next(new apiError(`Invalid carCode. It must be a number.`, 400));
    }
    newCarCode = categoryCode.code + carCode;
  } else {
    const regex = new RegExp("^" + categoryCode.code + "\\d+$", "i");
    const cars = await Car.aggregate([
      { $match: { generatedCode: regex } },
      {
        $project: {
          numericCode: {
            $toInt: {
              $substr: [
                "$generatedCode",
                { $strLenCP: categoryCode.code },
                { $strLenCP: "$generatedCode" },
              ],
            },
          },
        },
      },
    ]);

    const validCodes = cars
      .map((car) => car.numericCode)
      .filter((num) => !isNaN(num) && num > 0)
      .sort((a, b) => a - b);

    if (validCodes.length > 0) {
      for (let i = 0; i < validCodes.length; i++) {
        if (validCodes[i] !== i + 1) {
          newCarCode = categoryCode.code + (i + 1);
          break;
        }
      }
      if (!newCarCode) {
        newCarCode = categoryCode.code + (validCodes.length + 1);
      }
    } else {
      newCarCode = categoryCode.code + "1";
    }
  }

  // Check user exists
  const user = await User.findById(id);
  if (!user) {
    return next(
      new apiError(
        "There is no user for this car, you must add user first",
        404,
      ),
    );
  }

  // Create car
  const newCar = await Car.create({
    ownerName: user.name,
    carNumber,
    chassisNumber: req.body.chassisNumber,
    color,
    brand,
    category,
    model,
    nextRepairDate,
    lastRepairDate,
    periodicRepairs,
    nonPeriodicRepairs,
    componentState: req.body.componentState,
    distances,
    motorNumber,
    generatedCode: newCarCode,
  });

  if (!newCar) {
    return next(new apiError(`Can't create car in database`, 500));
  }

  user.car.push({
    id: newCar._id,
    carCode: newCarCode,
    carNumber,
    brand,
    category,
    model,
  });
  await user.save({ validateBeforeSave: false });

  res.status(201).json({ data: { newCar, user } });
});

// @desc    Get list of all cars
// @route   GET /api/v1/Garage
// @access  Public
exports.getCars = asyncHandler(async (req, res) => {
  const nonAdminUsers = await User.find({ role: "user" }).select("name");
  const nonAdminUsernames = nonAdminUsers.map((user) => user.name);

  const filter = { ownerName: { $in: nonAdminUsernames } };

  const documentsCounts = await Car.countDocuments(filter);
  const apiFeatures = new ApiFeatures(Car.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields();

  const { mongooseQuery, paginationResult } = apiFeatures;
  let documents = await mongooseQuery;

  documents = documents.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  res
    .status(200)
    .json({ results: documents.length, paginationResult, data: documents });
});

// @desc    Get specific car by id
// @route   GET /api/v1/Garage/:id
// @access  Public
exports.getCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const car = await Car.findById(id);
  if (!car) {
    return next(new apiError(`Can't find car with this id ${id}`, 404));
  }

  const repairing = await Repairing.findOne({
    carNumber: { $in: car.carNumber },
    complete: true,
  });
  const currentRepair = await Repairing.findOne({
    carNumber: { $in: car.carNumber },
    complete: false,
  });

  res.status(200).json({ data: { car, repairing, currentRepair } });
});

// @desc    Get list of repairing cars
// @route   GET /api/v1/Garage/repairing
// @access  Public
exports.getRepairingCars = asyncHandler(async (req, res, next) => {
  const filter = req.filterObj || { State: "Repair" };

  const documentsCounts = await Car.countDocuments(filter);
  const apiFeatures = new ApiFeatures(Car.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields();

  const { mongooseQuery, paginationResult } = apiFeatures;
  let documents = await mongooseQuery;

  if (!documents) {
    return next(new apiError(`There are no cars in repairs`, 404));
  }

  documents = documents.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  // FIX: use documentsCounts instead of extra Car.find() query
  paginationResult.numberOfPages = Math.ceil(
    documentsCounts / paginationResult.limit,
  );

  res
    .status(200)
    .json({ results: documents.length, paginationResult, data: documents });
});

// @desc    Set car repair state
// @route   PUT /api/v1/Garage/repair/:carNumber
// @access  Private
exports.makeCarInRepair = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;
  const { repairing } = req.body;

  if (repairing === undefined || repairing === null) {
    return next(new apiError(`Must provide a value for repairing`, 400));
  }

  const car = await Car.findOneAndUpdate(
    { carNumber },
    { repairing },
    { new: true },
  );

  if (!car) {
    // FIX: was referencing undefined `id`, now uses carNumber
    return next(
      new apiError(`Can't find car with this car number ${carNumber}`, 404),
    );
  }

  res.status(200).json({ data: car });
});

// @desc    Update specific car
// @route   PUT /api/v1/Garage/:id
// @access  Private
exports.updateCar = factory.updateOne(Car);

// @desc    Search for all cars
// @route   GET /api/v1/Garage/search/:searchString
// @access  Private
exports.searchForallCars = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { documents, paginationResult } = await searchService({
    Model: Car,
    searchString,
    page,
    limit,
  });

  if (!documents || documents.length === 0) {
    return next(
      new apiError(
        `No document found for the search string ${searchString}`,
        404,
      ),
    );
  }

  res
    .status(200)
    .json({ results: documents.length, paginationResult, data: documents });
});

// @desc    Search for repairing cars
// @route   GET /api/v1/Garage/search/repairing/:searchString
// @access  Private
exports.searchForRepairingCars = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const { documents, paginationResult } = await searchService({
    Model: Car,
    searchString,
    baseFilter: { State: "Repair" },
    page,
    limit,
  });

  if (!documents || documents.length === 0) {
    return next(
      new apiError(
        `No document found for the search string ${searchString}`,
        404,
      ),
    );
  }

  res
    .status(200)
    .json({ results: documents.length, paginationResult, data: documents });
});

// @desc    Delete car
// @route   DELETE /api/v1/Garage/:id
// @access  Private
exports.deleteCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const expectedCar = await Car.findById(id);
  if (!expectedCar) {
    return next(new apiError(`Can't find car with this id ${id}`, 404));
  }

  const user = await User.findOne({ name: expectedCar.ownerName });
  if (!user) {
    return next(new apiError(`Can't find owner for this car`, 404));
  }

  if (user.car.length > 1) {
    user.car = user.car.filter((c) => c.carNumber !== expectedCar.carNumber);
    await user.save({ validateBeforeSave: false });
    await expectedCar.deleteOne();
    res.status(200).json({ message: "Car deleted successfully" });
  } else {
    await user.deleteOne();
    await expectedCar.deleteOne();
    res.status(200).json({ message: "User and car deleted successfully" });
  }
});
