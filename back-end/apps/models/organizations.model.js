const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrganizationSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    user_id: {
        type: String,
        required: true,
    },
    can_invite: {
        type: Number,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

// Export the model
module.exports = mongoose.model('organizations', OrganizationSchema);