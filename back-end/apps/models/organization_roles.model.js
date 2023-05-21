const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OrganizationRolesSchema = new Schema({
    organization_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        required: true,
    },
    level_id: {
        type: Schema.Types.ObjectId,
        ref: 'levels',
        required: true,
    },
    role_name: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('organization_roles', OrganizationRolesSchema);