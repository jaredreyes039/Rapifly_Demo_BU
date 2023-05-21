const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ChallangeAttachmentsSchema = new Schema({
    challange_id: {
        type: Schema.Types.ObjectId,
        ref: 'opportunities_problems',
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
module.exports = mongoose.model('challange_attachments', ChallangeAttachmentsSchema);
