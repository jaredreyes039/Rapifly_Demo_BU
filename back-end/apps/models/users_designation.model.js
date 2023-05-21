const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UsersDesignationSchema = new Schema({
    hierarchy_id: {
        type: Schema.Types.ObjectId,
        ref: 'hierarchy',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    parent_user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
module.exports = mongoose.model('users_desginations', UsersDesignationSchema);