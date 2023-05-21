const OrganizationRoles = require('../models/organization_roles.model');

exports.create = async function(request, response) {
    var body = request.body;
    try {
        const roles = new OrganizationRoles(request.body)
        await roles.save();

        if (roles) {
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
    } catch (err) {
        console.log(err)
        return response.status(400).send({ status: false, message: err })
    }
};

exports.get = async function(request, response) {
    try {
        OrganizationRoles.aggregate([{
                $lookup: {
                    from: 'organizations',
                    localField: 'organization_id',
                    foreignField: '_id',
                    as: 'organization'
                },
            },
            {
                $unwind: "$organization"
            },
            {
                $lookup: {
                    from: 'levels',
                    localField: 'level_id',
                    foreignField: '_id',
                    as: 'level'
                },
            },
            {
                $unwind: "$level"
            },
        ], function(err, roles) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                roles = JSON.parse(JSON.stringify(roles));

                return response.send({
                    status: true,
                    data: roles
                })
            }
        });
    } catch (error) {
        console.log(error)
        return response.status(400).send({ status: false, message: error })
    }
};

//Update role
exports.update = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.level_name) {
        return response.send({
            status: false,
            message: "Level name, Plan and Level priority are required."
        });
    }

    try {
        OrganizationRoles.updateOne({ _id: body.id }, {
            plan_id: body.plan_id,
            level_id: body.level_id,
            role_name: body.role_name
        }, function(error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Level details has been updated."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.get_by_organization_id = function(request, response) {
    var body = request.body;

    if (!body.organization_id) {
        return response.send({
            status: false,
            message: "Level id is required"
        });
    }

    try {
        OrganizationRoles.find({
            organization_id: body.organization_id
        }, function(error, roles) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
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