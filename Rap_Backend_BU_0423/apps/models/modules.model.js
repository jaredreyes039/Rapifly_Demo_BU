const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let GoalsSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    parent_module_id: {
        type: String,
        default: ""
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
        required: false
    },
    supervisor: {
        type: String,
        trim: true

    },
    department: {
        type: String,
        trim: true

    },
    start_date_time: {
        type: Date,
        required: true,
    },
    end_date_time: {
        type: Date,
        required: true,
    },
    security: {
        type: String,
        default: 'public',
    },
    production_target: {
        type: Number,
        default: 0,
    },
    production_high_variance_alert: {
        type: Number,
        default: 0,
    },
    production_low_variance_alert: {
        type: Number,
        default: 0,
    },
    production_weight: {
        type: Number,
        default: 0,
    },
    expense_target: {
        type: Number,
        default: 0,
    },
    expense_high_variance_alert: {
        type: Number,
        default: 0,
    },
    expense_low_variance_alert: {
        type: Number,
        default: 0,
    },
    expense_weight: {
        type: Number,
        default: 0,
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
        require: true
    },
    created_at: {
        type: Number,
        default: Date.now
    }
});

// Export the model
module.exports = mongoose.model('modules', GoalsSchema);