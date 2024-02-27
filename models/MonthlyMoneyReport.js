// models/MonthlyMoneyReport.js
const mongoose = require('mongoose');

const monthlyMoneyReportSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    credits: { type: Number, default: 0 },
    debits: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MonthlyMoneyReport', monthlyMoneyReportSchema);
