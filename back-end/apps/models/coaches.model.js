const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator')

let CoachesSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true
    },
    last_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: false,
        default: ''
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    industries: {
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
module.exports = mongoose.model('coaches', CoachesSchema);