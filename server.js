const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cron = require("node-cron");
const axios = require("axios");
const http = require("http");

dotenv.config({ path: "config.env" });

const { initSocket } = require("./utils/notifications/socket.js");
const startCronJobs = require("./utils/notifications/remind.js");

const apiError = require("./utils/apiError");
const dbconnection = require("./config/database");

// Routes
const GarageRoute = require("./routes/GarageRoute");
const InvRoute = require("./routes/inventoryRoute");
const userRoute = require("./routes/userRoute");
const authRoute = require("./routes/authRoute");
const repairingRoute = require("./routes/repairingRoute");
const homeRoute = require("./routes/homeRoute");
const workerRoute = require("./routes/WorkersRoute");
const MonthlyReport = require("./routes/monthlyReportRoute");
const CategoryCode = require("./routes/CategoryCodeRoute");
const appVersion = require("./routes/appVersionRoute");
const changeColor = require("./routes/changeColorRoute");
const getCarImage = require("./routes/getCarImageRoute");
const ClearCarData = require("./routes/ClearCarDataRoute");
const notRoute = require("./utils/notifications/notRoute.js");

const globalError = require("./middlewares/errorMiddleWare");

// DB connection
dbconnection();

// Express app
const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.options("*", cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode ${process.env.NODE_ENV}`);
}

// Routes
app.use("/api/V2/Inventort", InvRoute);
app.use("/api/V2/Garage", GarageRoute);
app.use("/api/V2/User", userRoute);
app.use("/api/V2/auth", authRoute);
app.use("/api/V2/repairing", repairingRoute);
app.use("/api/V2/Home", homeRoute);
app.use("/api/V2/Worker", workerRoute);
app.use("/api/V2/MonthlyReport", MonthlyReport);
app.use("/api/V2/Category", CategoryCode);
app.use("/api/V2/appVersion", appVersion);
app.use("/api/V2/color", changeColor);
app.use("/api/V2/GetCarImage", getCarImage);
app.use("/api/V2/ClearCarData", ClearCarData);
app.use("/api/V2/Notifications", notRoute);

// Ping API
app.get("/api/ping", (req, res) => {
  res.status(200).send("Server is alive!");
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new apiError(`can not find this route ${req.originalUrl}`, 400));
});

// Global error handler
app.use(globalError);

const PORT = process.env.PORT || 4100;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

startCronJobs();

// Handle unhandled rejection
process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection error ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down ......`);
    process.exit(1);
  });
});

// Self-ping
cron.schedule("*/14 * * * *", () => {
  if (!process.env.BASE_URL) return;

  console.log("Pinging the server...");

  axios
    .get(`${process.env.BASE_URL}/api/ping`)
    .then((res) => {
      console.log("Ping success");
    })
    .catch((err) => {
      console.error("Ping failed:", err.message);
    });
});
