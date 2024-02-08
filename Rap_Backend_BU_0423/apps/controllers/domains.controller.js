const Domains = require('../models/domains.model');

exports.create = async function(request, response) {
    try {
        const domains = new Domains(request.body)
        await domains.save();

        if (domains) {
            return response.status(201).send({
                status: true,
                message: "Domain has been created successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. Domain has not been created."
            })
        }
    } catch (err) {
        return response.status(400).send({ status: false, message: err })
    }
};

exports.get = async function(request, response) {
    try {
        Domains.aggregate([{
                $lookup: {
                    from: 'plans',
                    localField: 'plan_id',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: "$plan"
            },
        ], function(err, domains) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                domains = JSON.parse(JSON.stringify(domains));

                return response.send({
                    status: true,
                    data: domains
                })
            }
        });
    } catch (error) {
        console.log(error)
        return response.status(400).send({ status: false, message: error })
    }
};

//Update domain
exports.update = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.domain_name) {
        return response.send({
            status: false,
            message: "Domain name and id are required."
        });
    }

    try {
        Domains.updateOne({ _id: body.id }, {
            plan_id: body.plan_id,
            can_invite: body.can_invite,
            domain_name: body.domain_name
        }, function(error, domain) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Domain details has been updated."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

//Update domain status
exports.updateStatus = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.status) {
        return response.send({
            status: false,
            message: "Domain status and id are required."
        });
    }

    try {
        Domains.updateOne({ _id: body.id }, {
            status: body.status
        }, function(error, domain) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Domain status has been updated suucessfully."
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
        Domains.find({
            plan_id: body.plan_id
        }, function(error, domains) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: domains
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};