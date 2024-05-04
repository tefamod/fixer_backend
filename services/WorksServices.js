const Worker = require("../models/Worker");
//const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const apiError = require("../utils/apiError");
const moment = require("moment");
// @desc add Worker
// @Route post /api/v1/Worker
// @access private
exports.addWorker = asyncHandler(async (req, res) => {
  const { name, phoneNumber, jobTitle, salary, IdNumber } = req.body;

  const newDoc = await Worker.create({
    name,
    phoneNumber,
    jobTitle,
    salary,
    IdNumber,
    salaryAfterProcces: salary,
  });
  res.status(201).json({ data: newDoc });
});

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
  const { date, loans, penalty, reward, newMonthe } = req.body;
  let total = 0;
  if (loans > 0 || penalty > 0 || reward < 0) {
    return next(
      new apiError(
        `the loans and penalty must be negative and reward must be positive`,
        400
      )
    );
  }
  const worker = await Worker.findById(id);

  if (!worker) {
    return next(
      new apiError(`Can't find worker with this national id ${id}`, 404)
    );
  }

  if (newMonthe) {
    worker.salaryAfterProcces = worker.salary;
  }

  // Deduct loans from salary if applicable
  if (loans < 0) {
    worker.loans.push({ date, amount: loans });
    total = total + loans;
  }

  // Deduct penalties from salary if applicable
  if (penalty < 0) {
    worker.penalty.push({ date, amount: penalty });
    total = total + penalty;
  }

  // Add rewards to salary if applicable
  if (reward > 0) {
    worker.reward.push({ date, amount: reward });
    total = total + reward;
  }
  worker.salaryAfterProcces = worker.salaryAfterProcces + total;
  // Save the updated worker document
  await worker.save();

  // Send response with updated worker data
  res.status(201).json({ data: worker });
});
