const CategoryCode = require("../models/categoryCode");
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const apiError = require("../utils/apiError");

// @doc create category code
// @Route post /api/v1/Category/
// @access private

exports.createCategoryCode = asyncHandler(async (req, res, next) => {
  const { category, code } = req.body;
  if (!category || !code) {
    return next(new apiError(`must provide category and code`, 400));
  }
  const therecategory = await CategoryCode.findOne({ category });
  if (therecategory) {
    return next(
      new apiError(
        `this category is alaready used with this code  ${therecategory.code} and this is the id ${therecategory._id}`,
        400
      )
    );
  }
  const newCategoryCode = await CategoryCode.create({
    category,
    code,
  });
  res.status(201).json({ data: newCategoryCode });
});

// @doc get category by id
// @Route get /api/v1/Category/:id
// @access private
exports.getCategoryCode = factory.getOne(CategoryCode);

// @doc get all category and codes
// @Route get /api/v1/Category/
// @access private
exports.getallCategoryCode = factory.getAll(CategoryCode);

// @doc update category
// @Route put /api/v1/Category/:id
// @access private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { category } = req.body;
  const newcategory = await CategoryCode.findByIdAndUpdate(
    id,
    { category: category },
    { new: true }
  );
  if (!newcategory) {
    return next(new apiError(`there is no category with this id ${id}`, 404));
  }
  res.status(200).json({ data: newcategory });
});

// @doc search in category
// @Route get /api/v1/Category/search/:searchString
// @access private
exports.searchInCategory = asyncHandler(async (req, res, next) => {
  const { searchString } = req.params;

  let query = CategoryCode.find();

  if (searchString) {
    const schema = CategoryCode.schema;
    const paths = Object.keys(schema.paths);

    for (let i = 0; i < paths.length; i++) {
      const orConditions = paths
        .filter(
          (path) =>
            schema.paths[path].instance === "String" && // Filter only string type parameters
            (path === "category" || path === "code") // Filter specific fields for search
        )
        .map((path) => ({
          [path]: { $regex: searchString, $options: "i" },
        }));

      query = query.or(orConditions);
    }
  }

  const documents = await query;

  if (!documents || documents.length === 0) {
    return next(
      new apiError(
        `No document found for the search string ${searchString}`,
        404
      )
    );
  }
  sortedCategory = documents.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.status(200).json({ data: sortedCategory });
});

// @doc get all categories
// @Route put /api/v1/Category/getall/
// @access private
exports.getallCategoryOnly = asyncHandler(async (req, res, next) => {
  const categories = await CategoryCode.find({}, "category");

  // Extract the categories from the documents
  const categoryList = categories.map((doc) => doc.category);

  res.status(200).json({ data: categoryList });
});
