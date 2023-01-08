const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PlanAttachmentSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'goals',
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
module.exports = mongoose.model('plan_attachments', PlanAttachmentSchema);
