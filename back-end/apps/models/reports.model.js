const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ReportsSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    goal_id: {
        type: Schema.Types.ObjectId,
        ref: 'goals',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    actual_production: {
        type: Number,
        default: 0
    },
    actual_expense: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: Date.now
    }
});

// Export the model
module.exports = mongoose.model('reports', ReportsSchema);