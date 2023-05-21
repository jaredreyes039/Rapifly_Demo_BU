const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProposeSchema = new Schema({
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
    superior_id: {
        type: String,
        required: false,
    },
    // status: 0 - In-Active, 1 - Active
    status: {
        type: Number,
        default: 1
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('propose', ProposeSchema);