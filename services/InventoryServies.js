const Inventory = require("../models/Inventory");
//const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");

// @desc add Component
// @Route GET /api/v1/Inventort
// @access private
exports.addComponent = factory.addOne(Inventory);

// @desc Get list of Components
// @Route GET /api/v1/Inventort
// @access private
exports.getAllCom = factory.getAll(Inventory);
//exports.getAllCom = asyncHandler(async (req, res) => {
//  const page = req.query.page * 1 || 1;
//  const limit = req.query.limit * 1 || 5;
//  const skip = (page - 1) * limit; // if page 2 then (2-1)*5=5 then it will skip the first 5 docs
//  const components = await Inventory.find({}).skip(skip).limit(limit);
// res.status(200).json({ results: components.length, page, data: components });
//});

// @desc Get spacific Component
// @Route GET /api/v1/Inventort
// @access private
exports.getCom = factory.getOne(Inventory);

// @desc Update spacific Component
// @Route GET /api/v1/Inventort
// @access private
exports.UpdateComponent = factory.updateOne(Inventory);
