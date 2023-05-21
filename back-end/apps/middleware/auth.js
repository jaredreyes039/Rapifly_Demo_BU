const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const auth = async(req, res, next) => {
    if (!req.header('Authorization') || typeof req.header('Authorization') == 'undefined') {
        return res.status(401).send({ status: false, message: 'Authorize token is missing.' })
    } else {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data = jwt.verify(token, process.env.JWT_KEY)
        try {
            const user = await User.findOne({ _id: data._id, 'tokens.token': token })
            if (!user) {
                // throw new Error()
                return res.status(401).send({ status: false, message: 'User has not been found.' })
            }
            req.user = user
            req.token = token
            next();
        } catch (error) {
            return res.status(401).send({ status: false, message: 'Not authorized to access this resource' })
        }
    }
}

module.exports = auth;