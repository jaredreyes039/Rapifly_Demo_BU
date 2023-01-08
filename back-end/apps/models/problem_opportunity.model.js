const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let OpportunityProblemSchema = new Schema({
    challange:{
        type: String,
        trim: true
    },
    description:{
        type: String,
        trim: true
    },
    plan_id:{
        type: Schema.Types.ObjectId,
        ref: 'plans',
        required: true,
    },
    user_id:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    created_at: {
        type: Number,
        default: Date.now
    },
});

// Export the model
module.exports = mongoose.model('opportunities_problems', OpportunityProblemSchema);
