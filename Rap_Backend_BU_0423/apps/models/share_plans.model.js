const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let SharePlansSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    user_group_id: {
        type: String,
        required: false
    },
    shared_user_ids: [],
    created_at: {
        type: Number,
        default: Date.now
    },
});

module.exports = mongoose.model('share_plans', SharePlansSchema);
