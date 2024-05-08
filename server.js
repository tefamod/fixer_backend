const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config({ path: "config.env" });
const apiError = require("./utils/apiError");
const dbconnection = require("./config/database");
//const categoryRoute = require("./routes/categoryRoutes");
//const SubCategoryRoute = require("./routes/subCategoryRoutes");
const GarageRoute = require("./routes/GarageRoute");
const InvRoute = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const repairingRoute = require("./routes/repairingRoute");
const homeRoute = require("./routes/homeRoute");
const workerRoute = require("./routes/WorkersRoute");
const MonthlyReport = require("./routes/monthlyReportRoute");
const CategoryCode = require("./routes/CategoryCodeRoute");
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
app.use("/api/V1/Garage", GarageRoute);
app.use("/api/V1/User", userRoute);
app.use("/api/V1/auth", authRoute);
app.use("/api/V1/repairing", repairingRoute);
app.use("/api/V1/Home", homeRoute);
app.use("/api/V1/Worker", workerRoute);
app.use("/api/V1/MonthlyReport", MonthlyReport);
app.use("/api/V1/Category", CategoryCode);
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
