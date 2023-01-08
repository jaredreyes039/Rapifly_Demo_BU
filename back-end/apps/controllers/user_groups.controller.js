const UserGroups = require('../models/user_groups.model');
const UserDesignation = require('../models/users_designation.model');

/**
 * Create new user group
 *
 * @param group_name, description, user_id, group_members, parent_user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 25/02/2020
 */
exports.create = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.group_name) {
        errors.push(['Group name is required']);
    }

    if (!body.description) {
        errors.push(['Description is required']);
    }

    if (!body.user_id) {
        errors.push(['User id is required']);
    }

    if (!body.group_members) {
        errors.push(['Group members is required']);
    }

    if (!body.parent_user_id) {
        errors.push(['Parent user id is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    // Create a new user
    try {
        var group_members = body.group_members;

        const user_group = new UserGroups({
            group_name: body.group_name,
            description: body.description,
            user_id: body.user_id,
            parent_user_id: body.parent_user_id
        });
        user_group.group_members = group_members;
        await user_group.save();

        return response.send({status: true, message: "User group has been created successfully."})
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

/**
 * Create get user groups by user
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 26/02/2020
 */
exports.getByUserId = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_id) {
        errors.push(['User id is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        UserGroups.find({user_id: body.user_id, status: 1}, function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                });
            } else {
                return response.send({
                    status: true,
                    data: results
                })
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

/**
 * Create get user groups by id
 *
 * @param id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 26/02/2020
 */
exports.getById = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(['id is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        UserGroups.findById(body.id, function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                });
            } else {
                if (result) {
                    result = JSON.parse(JSON.stringify(result));
                    var userids = result.group_members;

                    var hierarchyObj = {
                        path: 'hierarchy_id'
                    };

                    var userObj = {
                        path: 'user_id'
                    };

                    UserDesignation.find({user_id: {$in: userids}}).populate(hierarchyObj).populate(userObj).exec(function (error, results) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong"
                            });
                        } else {
                            return response.send({
                                status: true,
                                data: {
                                    user_group: result,
                                    group_members: results
                                }
                            })
                        }
                    })
                } else {
                    return response.send({
                        status: true,
                        data: ''
                    })
                }

            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

/**
 * update user group status
 *
 * @param id, status
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 26/02/2020
 */
exports.updateStatus = async function (request, response) {
    var body = request.body;

    if (!body.id && !body.status) {
        return response.send({
            status: false,
            message: "id and status are required."
        });
    }

    try {
        UserGroups.updateOne({_id: body.id}, {
            status: body.status
        }, function (error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Status hase been updated Successfully."
                })
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

/**
 * update user group
 *
 * @param id, status
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 26/02/2020
 */
exports.update = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(['id is required']);
    }

    if (!body.group_name) {
        errors.push(['Group name is required']);
    }

    if (!body.description) {
        errors.push(['Description is required']);
    }

    if (!body.group_members) {
        errors.push(['Group members is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        UserGroups.updateOne({_id: body.id}, {
            group_name: body.group_name,
            description: body.description,
            group_members: body.group_members,
        }, function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "User group has been updated successfully."
                })
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};
