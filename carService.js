// services/carService.js
const Car = require('../models/Car');

// Add a new car and return the car object
exports.addCar = async (carData) => {
    try {
        const newCar = await Car.create(carData);
        return newCar;
    } catch (error) {
        throw error;
    }
};

// Get all cars with basic details
exports.getAllCars = async () => {
    try {
        const cars = await Car.find({}, { componentState: 0, periodicRepairs: 0, nonPeriodicRepairs: 0 });
        return cars;
    } catch (error) {
        throw error;
    }
};

// Get car by ID with basic details
exports.getCarById = async (carId) => {
    try {
        const car = await Car.findById(carId, { componentState: 0, periodicRepairs: 0, nonPeriodicRepairs: 0 });
        if (!car) {
            throw new Error('Car not found');
        }
        return car;
    } catch (error) {
        throw error;
    }
};

exports.editCar = async (carId, carData) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(carId, carData, { new: true });
        if (!updatedCar) {
            throw new Error('Car not found');
        }
        return updatedCar;
    } catch (error) {
        throw error;
    }
};

// Car login
exports.carLogin = async (req, res) => {
    const { generatedCode, generatedPassword } = req.body;
    try {
        const car = await Car.findOne({ generatedCode, generatedPassword });
        if (!car) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.json(car);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Car login
exports.carLogin = async (generatedCode, generatedPassword) => {
    try {
        const car = await Car.findOne({ generatedCode, generatedPassword });
        return car;
    } catch (error) {
        throw error;
    }
};


// Forget password - check credentials
exports.checkCredentials = async (email, phone, code, carIdNumber) => {
    try {
        const car = await Car.findOne({ carIdNumber });
        if (!car || car.email !== email || car.phoneNumber !== phone || car.generatedCode !== code) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
};