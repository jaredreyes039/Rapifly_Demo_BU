const Levels = require('../models/levels.model');

exports.create = async function(request, response) {
    var body = request.body;
    try {
        Levels.findOne({
            organization_id: body.organization_id,
            level_priority: body.level_priority
        }, async function(error, levels) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (levels) {
                    return response.send({
                        status: false,
                        message: `Level priority ${body.level_priority} has already assigned to ${levels.level_name} level.`
                    });
                } else {
                    const levels = new Levels(request.body)
                    await levels.save();
                    if (levels) {
                        return response.status(201).send({
                            status: true,
                            message: "Level has been created successfully."
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong. Level has not been created."
                        })
                    }
                }
            }
        });
    } catch (err) {
        return response.status(400).send({ status: false, message: err })
    }
};

exports.get = async function(request, response) {
    try {
        Levels.aggregate([{
                $lookup: {
                    from: 'organizations',
                    localField: 'organization_id',
                    foreignField: '_id',
                    as: 'organization'
                }
            },
            {
                $unwind: "$organization"
            },
        ], function(err, levels) {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                levels = JSON.parse(JSON.stringify(levels));

                return response.send({
                    status: true,
                    data: levels
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.get_by_id = async function(request, response) {
    var body = request.body;
    if (!body.level_id) {
        return response.send({
            status: false,
            message: "Level id is required"
        });
    }

    try {
        Levels.findById(body.level_id, function(error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: level
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.update = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.level_name) {
        return response.send({
            status: false,
            message: "Level name, Plan and Level priority are required."
        });
    }

    try {
        Levels.updateOne({ _id: body.id }, {
            level_name: body.level_name
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
            message: "Organization id is required"
        });
    }

    try {
        Levels.find({
            organization_id: body.organization_id
        }, function(error, levels) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: levels
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};