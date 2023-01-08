const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ChallangeChatSchema = new Schema({
    challange_id: {
        type: Schema.Types.ObjectId,
        ref: 'opportunities_problems',
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
module.exports = mongoose.model('challange_chats', ChallangeChatSchema);
