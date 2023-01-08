const Organizations = require('../models/organizations.model');

exports.create = async function(request, response) {
    try {
        const organization = new Organizations(request.body)
        await organization.save();

        if (organization) {
            return response.status(201).send({
                status: true,
                message: "Organization has been created successfully."
            })
        }
    } catch (err) {
        return response.status(400).send({ status: false, message: "Something went wrong." })
    }
};

exports.get = async function(request, response) {
    try {
        Organizations.find({}, function(err, organizations) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                organizations = JSON.parse(JSON.stringify(organizations));

                return response.send({
                    status: true,
                    data: organizations
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

//Update Organization
exports.update = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.name && !body.domain_name) {
        return response.send({
            status: false,
            message: "Organization name, Domain name and id are required."
        });
    }

    try {
        Organizations.updateOne({ _id: body.id }, {
            can_invite: body.can_invite,
            domain_name: body.domain_name,
            name: body.name,
        }, function(error, Organization) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Organization details has been updated."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

//Update Organization status
exports.updateStatus = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.status) {
        return response.send({
            status: false,
            message: "Organization status and id are required."
        });
    }

    try {
        Organizations.updateOne({ _id: body.id }, {
            status: body.status
        }, function(error, Organization) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Organization status has been updated suucessfully."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.get_by_plan_id = function(request, response) {
    var body = request.body;

    if (!body.plan_id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    try {
        Organizations.find({
            plan_id: body.plan_id
        }, function(error, Organizations) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: Organizations
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

module.exports.get_organization_by_user = function(request, response) {
    var body = request.body;

    if (!body.user_id) {
        return response.send({
            status: false,
            message: "User id is required"
        });
    }

    try {
        Organizations.findOne({
            user_id: body.user_id
        }, function(error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: records
                })
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};