const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PlanChatSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    message: {
        type: String,
        required: false,
    },
    attachments: [],
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('plan_chats', PlanChatSchema);
