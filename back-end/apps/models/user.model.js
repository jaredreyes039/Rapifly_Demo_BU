const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const validator = require('validator')

let UsersSchema = new Schema({
    first_name: {
        type: String,
        required: false,
        trim: true
    },
    last_name: {
        type: String,
        required: false,
        trim: true
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
    passwordChanged: {
        type: Boolean,
        required: true,
        default: true
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    role_id: {
        type: String,
        ref: 'roles',
        required: false
        },
    parent_user_id: { type: String, default: '' },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    created_at: { type: Number, default: Date.now },
    palnformfield: [],
    status: {
        type: Number,
        default: 1
    },
    avatar: {
        type: String,
        default: ''
    },
    delegationtimeout: {
        type: Number
    },
    instructionBoxOpen: {
        type: Boolean,
        require: false,
        default: true
    }
});

UsersSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

UsersSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

UsersSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

// Export the model
module.exports = mongoose.model('users', UsersSchema);