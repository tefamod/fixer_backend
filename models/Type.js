// models/Type.js
const mongoose = require('mongoose');

const typeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true }
});

module.exports = mongoose.model('Type', typeSchema);
