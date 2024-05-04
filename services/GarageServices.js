const Car = require("../models/Car");
const Repairing = require("../models/repairingModel");
const User = require("../models/userModel");
//const slugify = require("slugify");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiFeatures = require("../utils/apiFeatures");

const generateUniqueCode = async () => {
  let isUnique = false;
  let code;

  // Generate and check until a unique 8-digit code is found
  while (!isUnique) {
    code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existingCar = await Car.findOne({ generatedCode: code });

    if (!existingCar) {
      isUnique = true;
    }
  }

  return code;
};
// @desc add car
// @Route GET /api/v1/Garage
// @access private
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
  } = req.body;

  const existingCar = await Car.findOne({ carNumber });
  if (existingCar) {
    return next(
      new apiError(
        `There is already a car with the same car number ${carNumber}`,
        400
      )
    );
  }

  const generatedCode = await generateUniqueCode();
  const user = await User.findById(id);
  if (!user) {
    return next(
      new apiError(
        "there is no user for this car , you must add user first",
        404
      )
    );
  }
  const newCar = await Car.create({
    ownerName: user.name,
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
    componentState: req.body.componentState,
    distances,
    motorNumber,
    generatedCode: generatedCode,
  });

  if (!newCar) {
    return next(new apiError(`Can't create car in database`, 500));
  }

  if (user) {
    user.car.push({
      id: newCar._id,
      carCode: generatedCode,
      carNumber,
      brand,
      category,
      model,
    });
    await user.save();
  }

  res.status(201).json({ data: { newCar, user } });
});

// @desc Search for a car by car number
// @Route GET /api/v1/Garage/:carNumber
// @access private
/*exports.searchCarByNumber = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;

  const car = await Car.findOne({ carNumber });

  if (!car) {
    return next(
      new apiError(`Can't find car for this car Number ${carNumber}`, 404)
    );
  }

  res.status(201).json({ data: car });
});*/

// @desc Get list of all Cars
// @Route GET /api/v1/Garage
// @access public
exports.getCars = factory.getAll(Car);

// @desc spacific car by id
// @Route GET /api/v1/Garage/:id
// @access public
exports.getCar = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const car = await Car.findById(id);

  if (!car) {
    return next(new apiError(`Can't find car with this id  ${id}`, 404));
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

// @desc Get list of repairing Cars
// @Route GET /api/v1/Garage/repairing
// @access public
exports.getRepairingCars = asyncHandler(async (req, res, next) => {
  let filter = { State: "Repair" };
  if (req.filterObj) {
    filter = req.filterObj;
  }

  const documentsCounts = await Car.countDocuments();
  const apiFeatures = new ApiFeatures(Car.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields();

  let { mongooseQuery, paginationResult } = apiFeatures;
  let documents = await mongooseQuery;

  documents = documents.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const cars = await Car.find(filter);
  if (paginationResult.limit > cars.length) {
    paginationResult.numberOfPages = 1;
  } else {
    paginationResult.numberOfPages = Math.ceil(
      cars.length / paginationResult.limit
    );
  }
  /*let filter2 = { State: "Repair" };
  if (req.filterObj) {
    filter = req.filterObj;
  }
  const documentsCounts2 = await Car.countDocuments();
  const apiFeatures2 = new ApiFeatures(Car.find(filter2), req.query)
    .paginate(documentsCounts2)
    .filter()
    .search()
    .limitFields();

  const { mongooseQuery2, paginationResult2 } = apiFeatures2;
  let documents2 = await mongooseQuery2;
*/
  if (documents) {
    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  } else {
    return next(new apiError(`there is no cars in repaires`, 404));
  }
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

// @desc    search for cars
// @route   get /api/v1/Garage/search
// @access  Private
exports.searchForallCars = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params; // Assuming the search string is provided in the params
  // 1) Build query
  let query = Car.find();

  // If search string is provided, construct a query to search in all parameters
  if (searchString) {
    const schema = Car.schema;
    const paths = Object.keys(schema.paths);
    // Print type of each path
    /*console.log("Path Types:");
    paths.forEach((path) => {
      console.log(`${path}: ${schema.paths[path].instance}`);
    });*/
    for (let i = 0; i < paths.length; i++) {
      const orConditions = paths
        .filter(
          (path) =>
            schema.paths[path].instance === "String" && // Filter only string type parameters
            (path === "ownerName" ||
              path === "carNumber" ||
              path === "chassisNumber" ||
              path === "model" ||
              path === "brand" ||
              path === "motorNumber" ||
              path === "generatedCode") // Filter specific fields for search
        )
        .map((path) => ({
          [path]: { $regex: searchString, $options: "i" },
        })); // Construct regex conditions for each parameter

      // Add OR condition to the query
      query = query.or(orConditions);
    }
  }
  // 2) Execute query
  const documents = await query;

  if (!documents || documents.length === 0) {
    return next(
      new apiError(
        `No document found for the search string ${searchString}`,
        404
      )
    );
  }
  sortedCars = documents.sort(
    (a, b) => new Date(b.lastRepairDate) - new Date(a.lastRepairDate)
  );
  res.status(200).json({ data: sortedCars });
});

// @desc    search for reparing cars
// @route   get /api/v1/Garage/search/repairing/:searchString
// @access  Private
exports.searchForRepairingCars = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params;
  // 1) Build query
  let query = Car.find({ State: "Repair" });

  if (searchString) {
    const schema = Car.schema;
    const paths = Object.keys(schema.paths);

    for (let i = 0; i < paths.length; i++) {
      const orConditions = paths
        .filter(
          (path) =>
            schema.paths[path].instance === "String" && // Filter only string type parameters
            (path === "ownerName" ||
              path === "carNumber" ||
              path === "chassisNumber" ||
              path === "model" ||
              path === "brand" ||
              path === "motorNumber" ||
              path === "generatedCode") // Filter specific fields for search
        )
        .map((path) => ({
          [path]: { $regex: searchString, $options: "i" },
        }));

      query = query.or(orConditions);
    }
  }

  // 2) Execute query
  const documents = await query;
  if (!documents || documents.length === 0) {
    return next(
      new apiError(
        `No document found for the search string ${searchString}`,
        404
      )
    );
  }
  sortedCars = documents.sort(
    (a, b) => new Date(b.lastRepairDate) - new Date(a.lastRepairDate)
  );
  res.status(200).json({ data: sortedCars });
});
