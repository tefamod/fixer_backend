const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const apiError = require("./utils/apiError");
const dbconnection = require("./config/database");
//const categoryRoute = require("./routes/categoryRoutes");
//const SubCategoryRoute = require("./routes/subCategoryRoutes");
const Garage = require("./routes/GarageRoute");
const InvRoute = require("./routes/inventoryRoute");
const globalError = require("./middlewares/errorMiddleWare");

//db connection
dbconnection();
// express app
const app = express();
// middlewaers
app.use(express.json());
// eslint-disable-next-line eqeqeq
if (process.env.NODE_ENV == "development") {
  app.use(morgan("dev"));
  console.log(` mode ${process.env.NODE_ENV}`);
}

// Routes
app.use("/api/V1/Inventort", InvRoute);
app.use("/api/V1/Garage", Garage);
//app.use("/api/V1/Brands", BrandRoute);
//app.use("/api/V1/Products", productRoute);
app.all("*", (req, res, next) => {
  //create error and send it to error handling middleware
  // eslint-disable-next-line new-cap
  next(new apiError(`can not find this route ${req.originalUrl}`, 400));
});
//Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 4100;
const server = app.listen(PORT, () => {
  console.log(`app running on port ${PORT}`);
});
//handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection error ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down ......`);
    process.exit(1);
  });
});
