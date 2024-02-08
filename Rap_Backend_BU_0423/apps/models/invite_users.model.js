const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validator = require('validator')

let InviteUsersSchema = new Schema({
    hierarchy_id: {
        type: Schema.Types.ObjectId,
        ref: 'organizations',
        required: false
    },
    invited_by_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    user_id: {
        type: String,
        default: ''
    },
    parent_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
    has_registered: {
        type: Number,
        default: 0
    }
});

// Export the model
module.exports = mongoose.model('invite_users', InviteUsersSchema);