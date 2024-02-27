// controllers/carController.js
const Car = require('../models/Car');
const emailService = require('../services/emailService');

// Add a new car and send email to owner
exports.addCar = async (req, res) => {
    try {
        const newCar = await Car.create(req.body);
        // Send email to owner with generated code and password
        await emailService.sendCarCredentials(newCar);
        res.status(201).json(newCar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all cars with basic details
exports.getCars = async (req, res) => {
    try {
        const cars = await Car.find({}, { componentState: 0, periodicRepairs: 0, nonPeriodicRepairs: 0 });
        res.json(cars);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get car by ID with basic details
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id, { componentState: 0, periodicRepairs: 0, nonPeriodicRepairs: 0 });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit car details
exports.editCar = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCar = await Car.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCar) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(updatedCar);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Forget password - send email with password
exports.forgetPassword = async (req, res) => {
    const { email, phone, code, carIdNumber } = req.body;
    try {
        const car = await Car.findOne({ carIdNumber });
        if (!car || car.email !== email || car.phoneNumber !== phone || car.generatedCode !== code) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Send email with password
        await emailService.sendPasswordResetEmail(car);
        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};