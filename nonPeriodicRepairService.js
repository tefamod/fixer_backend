// services/nonPeriodicRepairService.js
const NonPeriodicRepair = require('../models/NonPeriodicRepair');

// Add a non-periodic repair
exports.addNonPeriodicRepair = async (carId, components, services) => {
    try {
        const newNonPeriodicRepair = await NonPeriodicRepair.create({
            car: carId,
            components,
            services
        });
        return newNonPeriodicRepair;
    } catch (error) {
        throw error;
    }
};

// Mark a non-periodic repair as complete
exports.completeNonPeriodicRepair = async (repairId) => {
    try {
        const repair = await NonPeriodicRepair.findByIdAndUpdate(repairId, { state: 'completed' }, { new: true });
        if (!repair) {
            throw new Error('Non-periodic repair not found');
        }
        return repair;
    } catch (error) {
        throw error;
    }
};

// Edit a non-periodic repair that is not completed
exports.editNotCompletedNonPeriodicRepair = async (repairId, components, services) => {
    try {
        const repair = await NonPeriodicRepair.findById(repairId);
        if (!repair) {
            throw new Error('Non-periodic repair not found');
        }
        if (repair.state === 'completed') {
            throw new Error('Cannot edit completed non-periodic repair');
        }
        repair.components = components;
        repair.services = services;
        await repair.save();
        return repair;
    } catch (error) {
        throw error;
    }
};
