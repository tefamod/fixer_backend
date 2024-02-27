// models/NonPeriodicRepair.js
const mongoose = require('mongoose');

const nonPeriodicRepairSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    repairDate: { type: Date, default: Date.now },
    componentsChanged: [String],
    services: [{
        service: String,
        state: { type: String, enum: ['done', 'not done'], default: 'not done' }
    }],
    additionalComponents: [String],
    discount: Number,
    totalCost: Number,
    state: { type: String, enum: ['in progress', 'completed'], default: 'in progress' },
    expectedFinishDate: Date
});

module.exports = mongoose.model('NonPeriodicRepair', nonPeriodicRepairSchema);
