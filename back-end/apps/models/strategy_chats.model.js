const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let StrategyChatSchema = new Schema({
    strategy_id: {
        type: Schema.Types.ObjectId,
        ref: 'strategies',
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
module.exports = mongoose.model('strategy_chats', StrategyChatSchema);
