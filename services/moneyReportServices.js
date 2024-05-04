const MonthlyMoneyReport = require("../models/MonthlyMoneyReport");
const Repair = require("../models/repairingModel");
const Worker = require("../models/Worker");
//const slugify = require("slugify");
const factory = require("./handlersFactory");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const { worker } = require("workerpool");

// @desc create a monthly Report
// @Route POST /api/v1/monthlyReport
// @access private

exports.createReport = asyncHandler(async (req, res, next) => {
  const { year, month } = req.body;
  /*
  // Create a start date and end date for the given year and month
  const startDate = new Date(year, month - 1, 1); // month - 1 because months are zero-indexed
  const endDate = new Date(year, month, 0); // Last day of the month

  // Find all repairs within the given month and year
    const repairs = await Repair.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });
  console.log(repairs.length);
  for (let i = 0; i < repairs.length; i++) {
    console.log(repairs[i]);
    console.log(i);
  }
  */
  const date = new Date(year, month);
  const report = await MonthlyMoneyReport.findOne({ date });
  if (report) {
    delete report._doc.additions;
    delete report._doc.date;
    res.status(200).json({ data: report });
  } else {
    const repairs = await Repair.find({
      $expr: {
        $and: [
          { $eq: [{ $year: "$createdAt" }, year] },
          { $eq: [{ $month: "$createdAt" }, month] },
        ],
      },
    });

    const totalIncome = repairs.reduce(
      (total, repair) => total + repair.priceAfterDiscount,
      0
    );
    const salariesAggregate = await Worker.aggregate([
      {
        $group: {
          _id: null,
          totalSalaries: { $sum: "$salary" },
        },
      },
    ]);

    const totalSalaries =
      salariesAggregate.length > 0 ? salariesAggregate[0].totalSalaries : 0;

    const totalGain = totalIncome - totalSalaries;
    if (totalIncome == 0) {
      return next(
        new apiError(
          `There No report for this month ${month} and this year ${year}`,
          404
        )
      );
    }

    const Money = await MonthlyMoneyReport.create({
      date,
      outCome: totalSalaries,
      encome: totalIncome,
      totalGain,
    });

    if (!Money) {
      return next(new apiError("There was an error in report creation", 400));
    }
    delete Money._doc.additions;
    delete Money._doc.date;

    res.status(201).json({ data: Money });
  }
});

// @desc get all a monthly Report
// @Route get /api/v1/monthlyReport
// @access private
exports.getAllReports = factory.getAll(MonthlyMoneyReport);

// @desc get specific a monthly Report by month
// @Route get /api/v1/monthlyReport:monthName
// @access private

exports.getThreePramsForSpecMon = asyncHandler(async (req, res, next) => {
  let { year_month } = req.params;

  // Splitting month_year into month and year
  let [year, month] = year_month.split("_").map(Number);
  month = parseInt(month);
  year = parseInt(year);
  // Validate month and year
  if (isNaN(month) || isNaN(year)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid month or year" });
  }

  const monthReport = await MonthlyMoneyReport.findOne({
    $expr: {
      $and: [
        { $eq: [{ $year: "$date" }, year] },
        { $eq: [{ $month: "$date" }, month] },
      ],
    },
  });

  if (!monthReport) {
    return next(
      new apiError(
        `There No report for this month ${month} and this year ${year}`,
        400
      )
    );
  }
  delete monthReport._doc.additions;
  delete monthReport._doc.date;
  res.status(201).json({ data: monthReport });
});

// @desc add  additions
// @Route post /api/v1/monthlyReport/addthing
// @access private

exports.addorSubthing = asyncHandler(async (req, res, next) => {
  const { date, price, title } = req.body;
  let posPrice = 0;
  const month = new Date(date).getMonth() + 1; // Months are zero-based in JavaScript, so we add 1
  const year = new Date(date).getFullYear();
  const dateM = new Date(year, month);
  let monthlyReport = await MonthlyMoneyReport.findOne({ date: dateM });
  if (!monthlyReport) {
    return next(
      new apiError(
        `There NO report for this month ${month} and this year ${year}`,
        404
      )
    );
  }
  monthlyReport.additions.push({ title, price, date });
  if (price > 0) {
    monthlyReport.encome += price;
    monthlyReport.totalGain += price;
  } else {
    posPrice = price * -1;
    monthlyReport.outCome += posPrice;
    monthlyReport.totalGain -= posPrice;
  }
  monthlyReport.save();
  res.status(200).json({ data: monthlyReport });
});

// @desc get all repair of the month
// @Route post /api/v1/monthlyReport/repairs
// @access private

exports.getmonthWork = asyncHandler(async (req, res, next) => {
  let { year_month } = req.params;

  // Splitting month_year into month and year
  let [year, month] = year_month.split("_").map(Number);
  month = parseInt(month);
  year = parseInt(year);
  // Validate month and year
  if (isNaN(month) || isNaN(year)) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid month or year" });
  }

  const repairs = await Repair.find({
    $expr: {
      $and: [
        { $eq: [{ $year: "$createdAt" }, year] },
        { $eq: [{ $month: "$createdAt" }, month] },
      ],
    },
  }).select("client brand category model createdAt priceAfterDiscount");

  const workers = await Worker.find().select("name salary");

  /*const repairsWithServiceNames = await Promise.all(
    repairs.map(async (repair) => {
      const services = await repair.populate("Services", "name");
      const serviceNameArray = services.Services.map(
        (Services) => Services.name
      );
      return {
        createdAt: repair.createdAt,
        priceAfterDiscount: repair.priceAfterDiscount,
        services: serviceNameArray,
      };
    })
  );*/

  const date = new Date(year, month);
  const monthlyReport = await MonthlyMoneyReport.findOne({ date });

  const additions = monthlyReport ? monthlyReport.additions : [];
  sortedRepairs = repairs.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  sortedWorkers = workers.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  sortedAdditions = additions.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res
    .status(200)
    .json({ data: { sortedRepairs, sortedWorkers, sortedAdditions } });
});
