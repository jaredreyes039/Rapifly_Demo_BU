const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserGroupsSchema = new Schema({
    group_name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    group_members: [],
    status: {
        type: Number,
        default: 1
    },
    parent_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

module.exports = mongoose.model('user_groups', UserGroupsSchema);