// models/CarComponent.js
const mongoose = require('mongoose');

const carComponentSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    component: String,
    state: { type: String, enum: ['good', 'needs repair'], default: 'good' },
    details: String
});

module.exports = mongoose.model('CarComponent', carComponentSchema);
