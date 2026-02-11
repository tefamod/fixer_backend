const searchService = async ({
  Model,
  searchString,
  searchFields = [],
  page = 1,
  limit = 10,
  sort = { createdAt: -1 },
}) => {
  const skip = (page - 1) * limit;

  let query = Model.find();

  if (searchString && searchFields.length > 0) {
    const orConditions = searchFields.map((field) => ({
      [field]: { $regex: searchString, $options: "i" },
    }));

    query = query.or(orConditions);
  }

  const documents = await query.sort(sort).skip(skip).limit(limit);

  const totalDocuments = await Model.countDocuments(query.getQuery());
  const totalPages = Math.ceil(totalDocuments / limit);

  return {
    documents,
    paginationResult: {
      currentPage: page,
      limit,
      numberOfPages: totalPages,
      totalDocuments,
    },
  };
};

module.exports = searchService;
