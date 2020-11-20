const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let QAFormsSchema = new Schema({
    form_name: {
        type: String,
        required: true,
        trim: true
    },
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        index: true,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        index: true,
        required: true
    },
    parent_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        index: true,
        required: true
    },
    form_controls: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('qa_forms', QAFormsSchema);
