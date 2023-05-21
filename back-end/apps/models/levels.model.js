const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LevelsSchema = new Schema({
    level_priority: {
        type: Number,
        required: true,
        trim: true
    },
    organization_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        index: true,
        required: true
    },
    level_name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Number,
        required: false,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('levels', LevelsSchema);