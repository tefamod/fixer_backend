// models/Car.js
const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    required: [true, "owner Name is required"],
  },
  carNumber: {
    type: String,
    required: [true, "Car Number is required"],
  },
  phoneNumber: {
    type: Number,
    required: [true, "phoneNumber is required"],
  },

  email: {
    type: String,
    required: [true, "email is required"],
  },
  carIdNumber: {
    type: String,
    required: [true, "carId Number is required"],
  },
  color: {
    type: String,
    required: [true, "color is required"],
  },
  state: {
    type: String,
    enum: ["in repair", "not done"],
    default: "not done",
  },
  brand: {
    type: String,
    required: [true, "brand is required"],
  },
  category: {
    type: String,
    required: [true, "category is required"],
  },
  model: {
    type: String,
    required: [true, "model is required"],
  },
  generatedCode: {
    type: String,
    unique: true,
    maxlength: 8,
  },
  generatedPassword: {
    type: String,
  },
  nextRepairDate: {
    type: Date,
  },
  periodicRepairs: {
    type: Number,
    default: 0,
  },
  nonPeriodicRepairs: {
    type: Number,
    default: 0,
  },
  componentState: [
    {
      component: String,
      state: String,
      details: String,
    },
  ],
  repairing: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Car", carSchema);
