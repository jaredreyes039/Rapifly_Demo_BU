const Role = require('../models/roles.model');

exports.role_create = async function(request, response) {
    // Create a new Role
    try {
        const role = new Role(request.body)
        await role.save();

        if (role) {
            return response.status(201).send({
                status: true,
                message: "Role has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Role has not been created."
            })
        }
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.role_get_all = async function(request, response) {
    // Create a new Role
    try {

        Role.find({}, function(error, roles) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong. Role has not been created."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: roles
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.get_by_name = async function(request, response) {
    var body = request.body;
    if (!body.role_name) {
        return response.send({
            status: false,
            message: "Role name is required"
        });
    }

    // Create a new Role
    try {
        Role.findOne({
            name: body.role_name
        }, function(error, role) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: role
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};