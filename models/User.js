const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['doctor', 'patient', 'admin'],
        required: true,
        default: 'patient'
    },
    online: {
        type: Boolean,
        default: false
    },
    rate: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('User', UserSchema);