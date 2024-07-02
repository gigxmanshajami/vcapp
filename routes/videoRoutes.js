// routes/videoRoutes.js
const express = require('express');
const { startVideoCall } = require('../controllers/videoController');
const router = express.Router();

router.post('/call', startVideoCall);

module.exports = router;
