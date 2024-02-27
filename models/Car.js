// models/Car.js
const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    ownerName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    carIdNumber: { type: String, required: true },
    color: String,
    state: { type: String, enum: ['in repair', 'not done'], default: 'not done' },
    brand: String,
    type: String,
    model: String,
    generatedCode: { type: String, unique: true, maxlength: 8 },
    generatedPassword: String,
    nextRepairDate: Date,
    periodicRepairs: { type: Number, default: 0 },
    nonPeriodicRepairs: { type: Number, default: 0 },
    componentState: [{
        component: String,
        state: String,
        details: String
    }]
});

module.exports = mongoose.model('Car', carSchema);
