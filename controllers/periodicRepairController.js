// controllers/periodicRepairController.js
const PeriodicRepair = require('../models/PeriodicRepair');
const emailService = require('../services/emailService');

// Add a periodic repair
exports.addPeriodicRepair = async (req, res) => {
    const { carId, components, services } = req.body;
    try {
        const newPeriodicRepair = await PeriodicRepair.create({
            car: carId,
            components,
            services
        });
        res.status(201).json(newPeriodicRepair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a periodic repair as complete
exports.completePeriodicRepair = async (req, res) => {
    const { repairId } = req.params;
    try {
        const repair = await PeriodicRepair.findByIdAndUpdate(repairId, { state: 'completed' }, { new: true });
        if (!repair) {
            return res.status(404).json({ error: 'Periodic repair not found' });
        }
        // Send email to owner
        await emailService.sendRepairCompletionEmail(repair.car);
        res.json(repair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Edit a periodic repair that is not completed
exports.editNotCompletedPeriodicRepair = async (req, res) => {
    const { repairId } = req.params;
    const { components, services } = req.body;
    try {
        const repair = await PeriodicRepair.findById(repairId);
        if (!repair) {
            return res.status(404).json({ error: 'Periodic repair not found' });
        }
        if (repair.state === 'completed') {
            return res.status(400).json({ error: 'Cannot edit completed periodic repair' });
        }
        repair.components = components;
        repair.services = services;
        await repair.save();
        res.json(repair);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
