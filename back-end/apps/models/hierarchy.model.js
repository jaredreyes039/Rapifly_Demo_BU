const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const validator = require('validator')

let HierarchySchema = new Schema({
    designation: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        default: ''
    },
    parent_hierarchy_id: {
        type: String,
        default: ''
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
module.exports = mongoose.model('hierarchy', HierarchySchema);