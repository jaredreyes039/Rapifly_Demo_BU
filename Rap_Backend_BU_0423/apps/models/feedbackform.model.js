const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FeedbackFormSchema = new Schema({
    created_at: {
        type: Number,
        default: Date.now
    },
    user_id : {
        type: String,
        required: true
    },
    subject : {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: false
    },
    feedback_message: {
        type: String,
        required: true
    },
    overall_rating: {
        type: String,
        required: false
    },
    share_rating: {
        type: String,
        required: false
    }
});

// Export the model
module.exports = mongoose.model('feedback', FeedbackFormSchema);
