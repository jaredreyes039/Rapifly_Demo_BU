const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RolesSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('roles', RolesSchema);