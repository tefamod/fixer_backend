// models/Worker.js
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    jobTitle: { type: String, required: true },
    salary: { type: Number, required: true }
});

module.exports = mongoose.model('Worker', workerSchema);
