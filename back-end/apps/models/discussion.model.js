const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Discussionchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    recipient_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    subject: {
        type: String,
        required: true
    },
    security: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: false
    },
    attachment: {
        type: String,
        required: false
    },
    created_at: {
        type: Number,
        default: Date.now
    }
});

// Export the model
module.exports = mongoose.model('discussions', Discussionchema);