// models/MonthlyMoneyReport.js
const mongoose = require("mongoose");

const monthlyMoneyReportSchema = new mongoose.Schema(
  {
    date: { type: Date },
    outCome: { type: Number },
    encome: { type: Number },
    totalGain: { type: Number, default: 0 },
    additions: [
      {
        title: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MonthlyMoneyReport", monthlyMoneyReportSchema);
