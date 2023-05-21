const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let DomainSchema = new Schema({
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    domain_name: {
        type: String,
        required: true,
        trim: true
    },
    can_invite: {
        type: Number,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
    status: {
        type: Number,
        default: 0
    }
});

// Export the model
module.exports = mongoose.model('plan_domains', DomainSchema);