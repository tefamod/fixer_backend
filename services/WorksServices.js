const Worker = require("../models/Worker");
//const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const apiError = require("../utils/apiError");

// @desc add Worker
// @Route post /api/v1/Worker
// @access private
exports.addWorker = factory.addOne(Worker);

// @desc Get list of Worker
// @Route GET /api/v1/Worker
// @access private
exports.getAllWorkers = factory.getAll(Worker);

// @desc Get spacific Worker
// @Route GET /api/v1/Worker
// @access private
exports.getWorker = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params;
  // 1) Build query
  let query = Worker.find();

  if (searchString) {
    const schema = Worker.schema;
    const paths = Object.keys(schema.paths);

    for (let i = 0; i < paths.length; i++) {
      const orConditions = paths
        .filter(
          (path) =>
            schema.paths[path].instance === "String" && // Filter only string type parameters
            (path === "IdNumber" || path === "name" || path === "phoneNumber") // Filter specific fields for search
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
  sortedRepairs = documents.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.status(200).json({ data: sortedRepairs });
});

// @desc Update spacific Worker
// @Route GET /api/v1/Worker
// @access private
exports.UpdateWorkerDetals = factory.updateOne(Worker);

// @desc delte Worker
// @Route DELTE /api/v1/Worker
// @access private
exports.deleteWorker = factory.deleteOne(Worker);

// @desc Update spacific Worker
// @Route GET /api/v1/Worker:IdNumber
// @access private
exports.UpdateWorkerDetalsByNID = asyncHandler(async (req, res, next) => {
  const { IdNumber } = req.params;

  // Assuming carNumber is a unique identifier in your Car model
  const worker = await Worker.findOneAndUpdate({ IdNumber }, req.body, {
    new: true,
  });

  if (!worker) {
    return next(
      new apiError(`Can't find worker with this national id  ${IdNumber}`, 404)
    );
  }

  res.status(201).json({ data: worker });
});

// @desc set reword or loans or penalty for worker
// @Route Post /api/v1/Worker/:id
// @access private
exports.moneyFromToworker = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { loans, penalty, reward } = req.body;
  let cal_salary = 0;

  // Assuming carNumber is a unique identifier in your Car model
  const worker = await Worker.findById(id);

  if (!worker) {
    return next(
      new apiError(`Can't find worker with this national id  ${id}`, 404)
    );
  }
  cal_salary = worker.salary;
  if (loans > 0 || penalty > 0 || reward < 0) {
    return next(
      new apiError(
        `loans and penalty must be negative and the reword must be positive`,
        400
      )
    );
  } else {
    cal_salary = cal_salary + loans + penalty + reward;
  }

  if (cal_salary > 0) {
    worker.salary = cal_salary;
    worker.loans = worker.loans + loans;
    worker.penalty = worker.penalty + penalty;
    worker.reward = worker.reward + reward;
    worker.save();
  }
  res.status(201).json({ data: worker });
});
