const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GoalAttachmentSchema = new Schema({
    goal_id: {
        type: Schema.Types.ObjectId,
        ref: 'goals',
        required: true,
    },
    attachment: {
        type: String,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('goal_attachments', GoalAttachmentSchema);
