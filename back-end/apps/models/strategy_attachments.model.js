const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let StrategyAttachmentsSchema = new Schema({
    strategy_id: {
        type: Schema.Types.ObjectId,
        ref: 'strategies',
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
module.exports = mongoose.model('strategy_attachments', StrategyAttachmentsSchema);
