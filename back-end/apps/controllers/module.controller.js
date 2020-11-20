const async1 = require("async");
const moment = require('moment');
const fs = require('fs');

const Goals = require('../models/goals.model');
const Discussion = require('../models/discussion.model');

exports.create = async function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var modules = new Modules(body);
        await modules.save();

        if (modules) {
            var moduleId = modules._id;

            if (request.files && request.files.attachment) {
                var element = request.files.attachment;
                var getTime = new Date().getTime();

                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/module_attachments/' + file_name, element.data, { mode: 0o755 });

                Modules.updateOne({ _id: moduleId }, { attachment: file_name }, function(error, result) {
                    if (error) {
                        console.log(error)
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        });
                    } else {
                        return response.send({
                            status: true,
                            message: "Modules has been created successfully."
                        });
                    }
                });
            } else {
                return response.send({
                    status: true,
                    message: "Modules has been created successfully."
                });
            }
        } else {
            return response.send({
                status: false,
                message: "Something went wrong."
            });
        }
    } catch (e) {
        console.log(e)
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

exports.getModulesByUserAndType = async function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.module_type) {
        errors.push(["Module type is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.find({ plan_id: body.plan_id, user_id: body.user_id, module_type: body.module_type, deactivate: 0 }, function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    data: results
                });
            }
        })
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

exports.createDiscussion = async function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var discussion = new Discussion(body);
        await discussion.save();

        if (discussion) {
            var discussionId = discussion._id;

            if (request.files && request.files.attachment) {
                var element = request.files.attachment;
                var getTime = new Date().getTime();

                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/module_attachments/' + file_name, element.data, { mode: 0o755 });

                Discussion.updateOne({ _id: discussionId }, { attachment: file_name }, function(error, result) {
                    if (error) {
                        console.log(error)
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        });
                    } else {
                        return response.send({
                            status: true,
                            message: "Discussion has been created successfully."
                        });
                    }
                });
            } else {
                return response.send({
                    status: true,
                    message: "Discussion has been created successfully."
                });
            }
        } else {
            return response.send({
                status: false,
                message: "Something went wrong."
            });
        }
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}