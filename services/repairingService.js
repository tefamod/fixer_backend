const Inventory = require("../models/Inventory");
const Repairing = require("../models/repairingModel");
const Car = require("../models/Car");
const User = require("../models/userModel");
//const slugify = require("slugify");
const apiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const asyncHandler = require("express-async-handler");

// @desc create a repairing
// @Route POST /api/v1/repairing
// @access private

exports.createRepairing = asyncHandler(async (req, res, next) => {
  let totalPrice = 0;
  let totalServicesCount = 0;
  let completedServices = 0;
  let periodicRepairs = 0;
  let nonperiodicRepairs = 0;
  let complete = false;
  let newId = 0;
  const const_part_of_id = "2021-";
  const {
    components,
    services,
    additions,
    carNumber,
    type,
    discount,
    daysItTake,
    nextPerDate,
    note1,
    note2,
  } = req.body;
  if (req.body.manually == "True" || req.body.manually == true) {
    const id = req.body.id;
    const parsedCarCode = parseInt(id, 10);

    if (isNaN(parsedCarCode) || !Number.isInteger(parsedCarCode)) {
      return next(new apiError(`Invalid carCode. It must be a number.`, 400));
    }

    newId = const_part_of_id + parsedCarCode;
    const exRepair = await Repairing.findOne({ genId: newId });
    if (exRepair) {
      return next(
        new apiError(`Repairing with id ${newId} already exists.`, 400)
      );
    }
  } else {
    const regex = new RegExp("^" + const_part_of_id + "\\d+$", "i");

    const repairs = await Repairing.aggregate([
      { $match: { genId: regex } }, // Match genId starting with '2021'
      {
        $project: {
          numericCode: {
            $toInt: {
              $substr: [
                "$genId",
                { $strLenCP: const_part_of_id }, // Skip the first 4 characters (2021)
                {
                  $subtract: [
                    { $strLenCP: "$genId" },
                    { $strLenCP: const_part_of_id },
                  ],
                }, // Get the remaining part
              ],
            },
          },
        },
      },
    ]);

    const validCodes = repairs
      .map((repair) => repair.numericCode)
      .filter((num) => !isNaN(num) && num > 0)
      .sort((a, b) => a - b);

    // Find the first missing number or create the next newId
    if (validCodes.length > 0) {
      for (let i = 0; i < validCodes.length; i++) {
        if (validCodes[i] !== i + 1) {
          newId = const_part_of_id + (i + 1);
          break;
        }
      }

      if (!newId) {
        newId = const_part_of_id + (validCodes.length + 1);
      }
    } else {
      newId = const_part_of_id + "1";
    }
  }
  if (!components || !services || !additions) {
    return next(
      new apiError(
        "Components, services, and additions arrays are required",
        400
      )
    );
  }

  try {
    const repairDetails = [];

    for (const { price, state } of services) {
      totalPrice += price;
      totalServicesCount++;
      if (state === "completed") {
        completedServices++;
      }
    }

    for (const { price } of additions) {
      totalPrice += price;
    }

    for (const { id, quantity } of components) {
      const inventoryComponent = await Inventory.findById(id);

      if (!inventoryComponent) {
        return next(
          new apiError(`Component with ID ${id} not found in inventory`, 404)
        );
      }
      if (
        inventoryComponent.quantity < quantity ||
        inventoryComponent.quantity < 0
      ) {
        return next(
          new apiError(`Not enough quantity for component with id ${id}`, 400)
        );
      }
      inventoryComponent.quantity -= quantity;

      await inventoryComponent.save();

      const componentPrice = inventoryComponent.price * quantity;
      totalPrice += componentPrice;

      repairDetails.push({
        name: inventoryComponent.name,
        quantity: quantity,
        price: componentPrice,
      });
    }
    /*if (type == "periodic") {
      periodicRepairs += 1;
    } else {
      nonperiodicRepairs += 1;
    }*/

    const reCar = await Car.findOne({ carNumber: carNumber });
    if (!reCar) {
      return next(new apiError(`No car for this number ${carNumber}`, 404));
    }
    periodicRepairs = reCar.periodicRepairs;
    nonperiodicRepairs = reCar.nonPeriodicRepairs;
    if (type == "periodic" || type == "nonPeriodic") {
      if (type == "periodic") {
        periodicRepairs += 1;
      } else {
        nonperiodicRepairs += 1;
      }
    } else {
      return next(
        new apiError(`the type must be periodic or nonPeriodic only`, 400)
      );
    }
    reCar.periodicRepairs = periodicRepairs;
    reCar.nonPeriodicRepairs = nonperiodicRepairs;

    reCar.save();
    const currentDate = new Date();
    const parsedNextPerDate = new Date(nextPerDate);
    if (completedServices === totalServicesCount) {
      complete = true;
      const lastRepairDate = new Date();
      const car = await Car.findOneAndUpdate(
        { carNumber: carNumber },
        {
          lastRepairDate: lastRepairDate,
          nextRepairDate: nextPerDate,
          repairing: !complete,
        },
        { new: true }
      );

      if (!car) {
        return next(new apiError(`No car for this number ${carNumber}`, 404));
      }
    }

    const completedServicesRatio =
      totalServicesCount > 0 ? completedServices / totalServicesCount : 0;
    const priceAfterDiscount = totalPrice - discount;

    let state = "";

    if (!complete) {
      state = "Repair";
    } else if (currentDate < parsedNextPerDate && complete) {
      state = "Good";
    } else {
      state = "Need to check";
    }
    const car_state = await Car.findOneAndUpdate(
      { carNumber: carNumber },
      { State: state },
      { new: true }
    );

    if (!car_state) {
      return next(new apiError(`No car for this number ${carNumber}`, 404));
    }
    await car_state.save();
    const car_ratio = await Car.findOneAndUpdate(
      { carNumber: carNumber },
      { completedServicesRatio: completedServicesRatio },
      { new: true }
    );

    if (!car_ratio) {
      return next(new apiError(`No car for this number ${carNumber}`, 404));
    }
    await car_ratio.save();
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + parseInt(daysItTake));

    const car = await Car.findOne({ carNumber });
    const repair = await Repairing.create({
      client: car.ownerName,
      genId: newId,
      brand: car.brand,
      category: car.category,
      model: car.model,
      component: repairDetails,
      Services: services,
      additions,
      carNumber,
      type,
      totalPrice,
      discount,
      priceAfterDiscount,
      expectedDate,
      complete,
      completedServicesRatio,
      state,
      Note1: note1,
      Note2: note2,
    });
    if (!complete) {
      const car = await Car.findOneAndUpdate(
        { carNumber: carNumber },
        { repairing_id: repair._id, repairing: true },
        { new: true }
      );

      if (!car) {
        return next(new apiError(`No car for this number ${carNumber}`, 404));
      }
      await car.save();
    }
    res.status(200).json();
  } catch (error) {
    console.error("Error:", error);
    next(new apiError("Internal Server Error", 500));
  }
});

// @desc Update inventory and save services
// @Route POST /api/v1/services
// @access private
/*exports.updateInventoryAndServices = asyncHandler(async (req, res, next) => {
  var componentsPrice = 0;
  var totalPrice = 0;
  var updatedComponents = []; // Array to store updated components
  var createdServices = []; // Array to store created services
  var createdChecks = []; // Array to store created checks
  var completedServicesCount = 0; // Counter for completed services
  var totalServicesCount = 0; // Counter for total services

  const { components, services, checks } = req.body; // Extract checks array from request body

  if (!components || !services || !checks) {
    return next(
      new apiError("Components, services, and checks arrays are required", 400)
    );
  }

  try {
    // Update inventory
    for (const { id, quantity } of components) {
      const component = await Inventory.findById(id);
      if (!component) {
        return next(new apiError(`Component with id ${id} not found.`, 404));
      }
      if (component.quantity < quantity) {
        return next(
          new apiError(`Not enough quantity for component with id ${id}`, 400)
        );
      }
      component.quantity -= quantity;
      componentsPrice += component.price * quantity; // Accumulate total price
      totalPrice = componentsPrice;
      await component.save();
      updatedComponents.push(component); // Add updated component to the array
    }

    // Save services
    for (const { name, price, carnumber, status, daysItTake } of services) {
      totalPrice += price; // Calculate total price for each service
      totalServicesCount++; // Increment total services count

      // Add daysItTake to the current date to get the expected date
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + parseInt(daysItTake));

      const service = await Services.create({
        name,
        price,
        status, // Include the status of the service
        totalPrice: totalPrice,
        comPrice: componentsPrice,
        carNumber: carnumber,
        state: status,
        expectedDate: expectedDate, // Save expected date
      });
      createdServices.push(service); // Add created service to the array
      if (status === "completed") {
        // Increment completed services count if status is 'completed'
        completedServicesCount++;
      }
    }

    // Save checks
    for (const { name, price, carnumber, daysItTake, nextCheck } of checks) {
      // Add daysItTake to the current date to get the expected date
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + parseInt(daysItTake));

      const nextcheckDate = new Date();
      nextcheckDate.setDate(nextcheckDate.getDate() + parseInt(nextCheck));
      const check = await Check.create({
        name,
        price,
        carNumber: carnumber,
        expectedDate: expectedDate, // Save expected date
        nextcheckDate: nextcheckDate, // Save next check date
      });
      createdChecks.push(check); // Add created service to the array
    }

    const completedServicesRatio =
      totalServicesCount > 0 ? completedServicesCount / totalServicesCount : 0; // Calculate completed services ratio

    res.status(200).json({
      data: {
        totalPrice: totalPrice,
        completedServicesRatio: completedServicesRatio,
        numServices: totalServicesCount,
        numChecks: createdChecks.length, // Return the number of checks created
      },
    }); // Send back the total price, completed services ratio, number of services, and number of checks in the JSON response
  } catch (error) {
    console.error("Error:", error);
    next(new apiError("Internal Server Error", 500));
  }
});
*/

// @desc Search for car services by car number
// @Route GET /api/v1/repairing/:carNumber
// @access private
exports.getCarRepairsByNumber = asyncHandler(async (req, res, next) => {
  const { carNumber } = req.params;

  try {
    const repairing = await Repairing.find({ carNumber });

    if (!repairing) {
      return next(
        new apiError(
          `Can't find services for this car number ${carNumber}`,
          404
        )
      );
    }
    sortedRepairs = repairing.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.status(200).json({ data: repairing });
  } catch (error) {
    console.error("Error:", error);
    next(new apiError("Internal Server Error", 500));
  }
});

// @desc Update service state in repairing schema by service ID
// @Route PUT /api/v1/repairing/:serviceId
// @access private
exports.updateServiceStateById = asyncHandler(async (req, res, next) => {
  let totalServicesCount = 0;
  let completedServices = 0;
  let currentDate = 0;
  let lastRepairDate = 0;
  let parsedNextPerDate = 0;
  const { serviceId } = req.params;
  const { newState } = req.body;

  try {
    const repairingDoc = await Repairing.findOne({ "Services._id": serviceId });

    if (!repairingDoc) {
      return next(
        new apiError(
          `Service with ID ${serviceId} not found in any repairing document`,
          404
        )
      );
    }

    const service = repairingDoc.Services.find((s) => s._id.equals(serviceId));

    if (!service) {
      return next(
        new apiError(
          `Service with ID ${serviceId} not found within any repairing document`,
          404
        )
      );
    }

    service.state = newState;
    for (const { state } of repairingDoc.Services) {
      totalServicesCount++;
      if (state === "completed") {
        completedServices++;
      }
    }

    if (completedServices === totalServicesCount) {
      repairingDoc.complete = true;
      currentDate = new Date();
      lastRepairDate = new Date();
      const car = await Car.findOneAndUpdate(
        { carNumber: repairingDoc.carNumber },
        {
          lastRepairDate: lastRepairDate,
        },
        { new: true }
      );

      parsedNextPerDate = car.nextRepairDate;
      if (!car) {
        return next(
          new apiError(`No car for this number ${repairingDoc.carNumber}`, 404)
        );
      }
    } else {
      repairingDoc.complete = false;
    }

    repairingDoc.completedServicesRatio =
      totalServicesCount > 0 ? completedServices / totalServicesCount : 0;

    let state = "";

    if (!repairingDoc.complete) {
      state = "Repair";
    } else if (currentDate < parsedNextPerDate && repairingDoc.complete) {
      state = "Good";
    } else {
      state = "Need to check";
    }
    const car_state = await Car.findOneAndUpdate(
      { carNumber: repairingDoc.carNumber },
      { State: state },
      { new: true }
    );

    if (!car_state) {
      return next(
        new apiError(`No car for this number ${repairingDoc.carNumber}`, 404)
      );
    }
    await car_state.save();
    const car_ratio = await Car.findOneAndUpdate(
      { carNumber: repairingDoc.carNumber },
      { completedServicesRatio: repairingDoc.completedServicesRatio },
      { new: true }
    );

    if (!car_ratio) {
      return next(
        new apiError(`No car for this number ${repairingDoc.carNumber}`, 404)
      );
    }
    await service.save();
    await car_ratio.save();

    await repairingDoc.save();

    res
      .status(200)
      .json({ data: service, message: `Service state updated to ${newState}` });
  } catch (error) {
    console.error("Error:", error);
    next(new apiError("Internal Server Error", 500));
  }
});

// @desc get all completed repairs
// @Route get /api/v1/repairing
// @access private
exports.getAllComRepairs = asyncHandler(async (req, res, next) => {
  let filter = { complete: true };

  const documentsCounts = await Repairing.countDocuments(filter);
  const apiFeatures = new ApiFeatures(Repairing.find(filter), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields()
    .sort();

  const { mongooseQuery, paginationResult } = apiFeatures;
  const repairs = await mongooseQuery;

  const carNumbers = repairs.map((repair) => repair.carNumber);

  const cars = await Car.find({ carNumber: { $in: carNumbers } });

  const carCodeMap = {};
  cars.forEach((car) => {
    carCodeMap[car.carNumber] = car.generatedCode;
  });

  let enrichedRepairs = repairs.map((repair) => {
    const carCode = carCodeMap[repair.carNumber];
    const car = cars.find((car) => car.carNumber === repair.carNumber);
    if (car) {
      return {
        brand: car.brand,
        category: car.category,
        model: car.model,
        client: repair.client,
        priceAfterDiscount: repair.priceAfterDiscount,
        carCode: carCode,
        paidOn: repair.createdAt,
        id: repair._id,
      };
    } else {
      return next(
        new apiError(
          `there is an error in car informations of this car number ${repair.carNumber}`,
          400
        )
      );
    }
  });
  enrichedRepairs = enrichedRepairs.sort(
    (a, b) => new Date(b.paidOn) - new Date(a.paidOn)
  );

  res.status(200).json({
    results: enrichedRepairs.length,
    paginationResult,
    data: enrichedRepairs,
  });
});

// @desc Search for car services by owner Name
// @Route GET /api/v1/repairing/owner/:ownerName
// @access private
exports.getCarRepairsByid = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const car = await Car.findById(id);

  if (!car || car.length === 0) {
    return next(new apiError(`Can't find services for this owner ${id}`, 404));
  }

  const repairing = await Repairing.find({
    carNumber: { $in: car.carNumber },
  });

  if (!repairing || repairing.length === 0) {
    return next(new apiError(`Can't find services for this owner ${id}`, 404));
  }
  sortedRepairs = repairing.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.status(200).json({ data: sortedRepairs });
});

// @desc Search for car services by generated Code
// @Route GET /api/v1/repairing/gen/:generatedCode
// @access private
exports.getCarRepairsByGenCode = asyncHandler(async (req, res, next) => {
  const { generatedCode } = req.params;

  const car = await Car.findOne({ generatedCode });

  if (!car) {
    return next(
      new apiError(
        `Can't find car with this generated Code ${generatedCode}`,
        404
      )
    );
  }

  const repairing = await Repairing.find({ carNumber: { $in: car.carNumber } });

  if (!repairing || repairing.length === 0) {
    return next(
      new apiError(`Can't find services for this car ${generatedCode}`, 404)
    );
  }
  sortedRepairs = repairing.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.status(200).json({ data: repairing });
});

// @desc get the detiles for repair report
// @Route GET /api/v1/repairing/report/:id
// @access private
exports.getRepairsReport = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const Repair = await Repairing.findById(id);

  if (!Repair) {
    return next(new apiError(`Can't find car with this id ${id}`, 404));
  }

  const carInfo = await Car.findOne({ carNumber: { $in: Repair.carNumber } });

  if (!carInfo) {
    return next(
      new apiError(`Can't find services for this car ${carInfo.carNumber}`, 404)
    );
  }

  const userInfo = await User.findOne({ name: { $in: carInfo.ownerName } });

  if (!userInfo) {
    return next(
      new apiError(`Can't car for this user ${carInfo.ownerName}`, 404)
    );
  }

  const info = {
    name: carInfo.ownerName,
    phone: userInfo.phoneNumber,
    carNumber: carInfo.carNumber,
    chassisNumber: carInfo.chassisNumber,
    brand: carInfo.brand,
    color: carInfo.color,
    distances: carInfo.distances,
    model: carInfo.model,
    clientCode: carInfo.generatedCode,
    note1: Repair.Note1,
    note2: Repair.Note2,
  };
  res.status(200).json({
    repair: Repair,
    data: info,
  });
});
