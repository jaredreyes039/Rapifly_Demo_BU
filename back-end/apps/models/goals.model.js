const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GoalsSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    parent_goal_id: {
        type: [String],
        default: ['#']
    },
    isReportReady: {
        type: Boolean,
        default: false,
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
        type: String,
        default: 'public',
    },
    select: {
        type: Number,
        default: 0
    },
    start_date: {
        type: Date,
        required: false,
    },
    end_date: {
        type: Date,
        required: false,
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
        type: String,
        required: false
    },
    expected_target: {
        type: String,
        required: false
    },
    shared_users: [],
    production_type: {
        type: String,
        required: false
    },
    production_target: {
        type: String,
        required: false
    },
    production_high_variance_alert: {
        type: String,
        required: false
    },
    production_low_variance_alert: {
        type: String,
        required: false
    },
    production_weight: {
        type: String,
        required: false
    },
    expense_target: {
        type: String,
        required: false
    },
    expense_high_variance_alert: {
        type: String,
        required: false
    },
    expense_low_variance_alert: {
        type: String,
        required: false
    },
    expense_weight: {
        type: String,
        required: false
    },
    attachment: {
        type: String,
        required: false
    },
    question: {
        type: String,
        required: false
    },
    answer: {
        type: String,
        required: false
    },
    source: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    },
    intelligence_value: {
        type: String,
        required: false
    },
    intelligence_response: {
        type: String,
        required: false
    },
    module_type: {
        type: String,
        default: 'goal'
    },
});

// Export the model
module.exports = mongoose.model('goals', GoalsSchema);