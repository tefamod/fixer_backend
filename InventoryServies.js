const Inventory = require("../models/Inventory");
//const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");

// @desc add Component
// @Route GET /api/v1/Inventort
// @access private
exports.addComponent = asyncHandler(async (req, res) => {
  const inventory = await Inventory.create(req.body);

  res.status(201).json({ data: inventory });
});

// @desc Get list of Components
// @Route GET /api/v1/Inventort
// @access private
exports.getAllCom = asyncHandler(async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit; // if page 2 then (2-1)*5=5 then it will skip the first 5 docs
  const components = await Inventory.find({}).skip(skip).limit(limit);
  res.status(200).json({ results: components.length, page, data: components });
});

// @desc Get spacific Component
// @Route GET /api/v1/Inventort
// @access private
exports.getCom = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const component = await Inventory.findById(id);
  if (!component) {
    return next(new apiError(`NO component for this id ${id}`, 404));
  }
  res.status(201).json({ data: component });
});

// @desc Update spacific Component
// @Route GET /api/v1/Inventort
// @access private
exports.UpdateComponent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const component = await Inventory.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
  });
  if (!component) {
    return next(new apiError(`NO sub component for this id ${id}`, 404));
  }
  res.status(201).json({ data: component });
});
