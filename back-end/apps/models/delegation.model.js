const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DelegationsSchema = new Schema({
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
    child_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    percentage: {
        type: Number,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    description: {
        type: String,
        trim: true
    },
    start_date: {
        type: Number,
        required: true,
    },
    end_date: {
        type: Number,
        required: true,
    },
    // is_accept: 0 - Invitation Sent, 1 - Accepted, 2 - Not Accepted
    is_accept: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('delegations', DelegationsSchema);