const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PlansSchema = new Schema({
    numbers: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Number,
        default: Date.now
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
    motivation: {
        type: String,
        default: ''
    },
    security: {
        type: Number,
        trim: true
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    plan_id: {
        type: String,
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    shared_permission_users: [],
    user_group_id: [],
    share_users: [], //Selected users from dropdown
    shared_plan_users: [], //merge both users from group and single user
    production_type: {
        type: String,
        require: false
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
});

// Export the model
module.exports = mongoose.model('plans', PlansSchema);