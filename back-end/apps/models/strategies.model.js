const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let StrategiesSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    numbers: {
        type: Number,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    long_name: {
        type: String,
        required: true,
        trim: true
    },
    short_name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true

    },
    security: {
        type: Number,
        trim: true
    },
    select: {
        type: Number,
        default: 0
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },

    prioritize: {
        type: Number,
        required: false,
    },
    deactivate: {
        type: Number,
        required: false,
        default: 0
    },
    propose: {
        type: Number,
        required: false,
        default: 0
    },
    weight: {
        type: Number,
        required: false,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
    countdown: {
        type: Number,
    },
    voteup: [],
    votedown: [],
    is_countdown_update: {
        type: Number,
        default: 0
    },
    revenue_target: {
        type: Number,
        required: true,
    },
    expected_target: {
        type: Number,
        required: true,
    },
    shared_users: []
});

// Export the model
module.exports = mongoose.model('strategies', StrategiesSchema);
