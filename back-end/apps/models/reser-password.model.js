const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

let ResetPasswordSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    resetPasswordToken: {
        type: String,
        required: true
    },
    expire: {
        type: String,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('reset_password', ResetPasswordSchema);