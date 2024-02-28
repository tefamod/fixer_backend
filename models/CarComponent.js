// models/CarComponent.js
const mongoose = require("mongoose");

const carComponentSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: [true, "Car is required"],
  },
  component: {
    type: String,
  },
  state: {
    type: String,
    enum: ["good", "needs repair"],
    default: "good",
  },
  details: {
    type: String,
  },
});

module.exports = mongoose.model("CarComponent", carComponentSchema);
