const User = require('../models/User');

exports.getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).sort({ online: -1 });
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDoctorStatus = async (req, res) => {
    const { userId, online } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { online });
        res.json({ message: 'Status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDoctorRate = async (req, res) => {
    const { userId, rate } = req.body;

    try {
        await User.findByIdAndUpdate(userId, { rate });
        res.json({ message: 'Rate updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
