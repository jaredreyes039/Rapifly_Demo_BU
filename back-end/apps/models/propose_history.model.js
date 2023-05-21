const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ProposeHistorySchema = new Schema({
    propose_id: {
        type: Schema.Types.ObjectId,
        ref: 'propose',
        required: true,
    },
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
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('propose_histories', ProposeHistorySchema);