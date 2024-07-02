const express = require('express');
const { getDoctors, updateDoctorStatus, updateDoctorRate } = require('../controllers/doctorController');
const router = express.Router();

router.get('/', getDoctors);
router.put('/status', updateDoctorStatus);
router.put('/rate', updateDoctorRate);

module.exports = router;
