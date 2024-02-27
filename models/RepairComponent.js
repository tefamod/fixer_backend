// models/RepairComponent.js
const mongoose = require('mongoose');

const repairComponentSchema = new mongoose.Schema({
    repair: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true },
    component: String,
    price: Number
});

module.exports = mongoose.model('RepairComponent', repairComponentSchema);
