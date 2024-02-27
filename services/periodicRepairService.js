// controllers/nonPeriodicRepairController.js
const NonPeriodicRepair = require('../models/NonPeriodicRepair');

// Add a non-periodic repair
exports.addNonPeriodicRepair = async (req, res) => {
    const { carId, components, services } = req.body;
    try {
        const newNonPeriodicRepair = await NonPeriodicRepair.create({
            car: carId,
            components,
            services
        });
        res.status(201).json(newNonPeriodicRepair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a non-periodic repair as complete
exports.completeNonPeriodicRepair = async (req, res) => {
    const { repairId } = req.params;
    try {
        const repair = await NonPeriodicRepair.findByIdAndUpdate(repairId, { state: 'completed' }, { new: true });
        if (!repair) {
            return res.status(404).json({ error: 'Non-periodic repair not found' });
        }
        res.json(repair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit a non-periodic repair that is not completed
exports.editNotCompletedNonPeriodicRepair = async (req, res) => {
    const { repairId } = req.params;
    const { components, services } = req.body;
    try {
        const repair = await NonPeriodicRepair.findById(repairId);
        if (!repair) {
            return res.status(404).json({ error: 'Non-periodic repair not found' });
        }
        if (repair.state === 'completed') {
            return res.status(400).json({ error: 'Cannot edit completed non-periodic repair' });
        }
        repair.components = components;
        repair.services = services;
        await repair.save();
        res.json(repair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
