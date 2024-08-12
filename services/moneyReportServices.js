const MonthlyMoneyReport = require("../models/MonthlyMoneyReport");
const Repair = require("../models/repairingModel");
const Worker = require("../models/Worker");
//const slugify = require("slugify");
const factory = require("./handlersFactory");
const apiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const { worker } = require("workerpool");

function getUTCDate(year, month) {
  return new Date(Date.UTC(year, month, 1));
}

exports.createReport = asyncHandler(async (req, res, next) => {
  let totalGain = 0;
  const { year, month } = req.body;

  const date = getUTCDate(year, month - 1);

  const oldReport = await MonthlyMoneyReport.findOne({
    date: {
      $gte: date,
      $lt: getUTCDate(year, month),
    },
  });

  if (oldReport) {
    res.status(200).json({ data: oldReport });
  } else {
    const repairs = await Repair.find({
      createdAt: {
        $gte: date,
        $lt: getUTCDate(year, month),
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
          totalSalaries: { $sum: "$salaryAfterReword" },
        },
      },
    ]);

    const totalSalaries =
      salariesAggregate.length > 0 ? salariesAggregate[0].totalSalaries : 0;

    totalGain = totalIncome - totalSalaries;

    const Money = await MonthlyMoneyReport.create({
      date,
      outCome: totalSalaries,
      encome: totalIncome,
      totalGain,
    });

    if (!Money) {
      return next(new apiError("There was an error in report creation", 400));
    }

    res.status(201).json({ data: Money });
  }
});

// @desc get all a monthly Report
// @Route get /api/v1/monthlyReport
// @access private
exports.getAllReports = factory.getAll(MonthlyMoneyReport);

// @desc put the bills and rent
// @Route put /api/v1/monthlyReport:yrea_month
// @access private
exports.put_the_bills_rent = asyncHandler(async (req, res, next) => {
  let { year_month } = req.params;
  const { electricity_bill, water_bill, gas_bill, rent } = req.body;
  let total_bills = 0;

  if (electricity_bill < 0 || water_bill < 0 || gas_bill < 0 || rent < 0) {
    return next(new apiError("The values must be positive", 400));
  }

  let [year, month] = year_month.split("_").map(Number);
  if (isNaN(month) || isNaN(year)) {
    return next(new apiError("Invalid month and year", 400));
  }

  //const date = getUTCDate(year, month-1);
  const report = await MonthlyMoneyReport.findOne({
    $expr: {
      $and: [
        { $eq: [{ $year: "$date" }, year] },
        { $eq: [{ $month: "$date" }, month] },
      ],
    },
  });

  if (!report) {
    return next(new apiError(`No report found for ${month}/${year}`, 404));
  }

  total_bills = electricity_bill + water_bill + gas_bill + rent;
  report.outCome += total_bills;
  report.totalGain -= total_bills;

  await report.save();

  const updatedReport = await MonthlyMoneyReport.findOneAndUpdate(
    {
      $expr: {
        $and: [
          { $eq: [{ $year: "$date" }, year] },
          { $eq: [{ $month: "$date" }, month] },
        ],
      },
    },
    {
      electricity_bill,
      water_bill,
      gas_bill,
      rent,
    },
    { new: true }
  );

  if (!updatedReport) {
    return next(
      new apiError(
        `There is no report for this month ${month} and year ${year}`,
        404
      )
    );
  }

  delete updatedReport._doc.additions;
  delete updatedReport._doc.date;

  res.status(201).json({ data: updatedReport });
});

// @desc add  additions
// @Route post /api/v1/monthlyReport/addthing
// @access private

exports.addorSubthing = asyncHandler(async (req, res, next) => {
  const { date, price, title } = req.body;
  let posPrice = 0;

  const month = new Date(date).getMonth();
  const year = new Date(date).getFullYear();

  const dateM = getUTCDate(year, month);

  let monthlyReport = await MonthlyMoneyReport.findOne({ date: dateM });

  if (!monthlyReport) {
    return next(
      new apiError(
        `There is no report for this month ${month + 1} and this year ${year}`,
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

  await monthlyReport.save();

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
