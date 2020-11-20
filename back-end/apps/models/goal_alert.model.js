const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GoalAlertsSchema = new Schema({
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
    message: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('goal_alerts', GoalAlertsSchema);