const async1 = require("async");
const moment = require('moment');
const fs = require('fs');

const Goals = require('../models/goals.model');
const Users = require('../models/user.model');
const Plan = require('../models/plan.model');
const Discussion = require('../models/discussion.model');
const emailHelper = require('../helpers/email.helper');
const { response } = require("express");

exports.create = async function (request, response) {
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

                Modules.updateOne({ _id: moduleId }, { attachment: file_name }, function (error, result) {
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

exports.findSelectedModule = async function (request, response) {
    let body = request.body;
    let errors = []

    if (!body._id){
        errors.push(["Module ID is required."])
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.find({_id: body._id}).then((doc)=>{
            return response.send({
                status: true,
                mesaage: "Successfully found module",
                data: doc
            })
        })
    }
    catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }

}

exports.getModulesByUserAndType = async function (request, response) {
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
        Goals.find({ plan_id: body.plan_id, user_id: body.user_id, module_type: body.module_type, deactivate: 0 }, function (error, results) {
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

exports.createDiscussion = async function (request, response) {
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

        Users.findOne({ _id: body.recipient_id }, { email: 1 }, (err, email) => {
            console.log(err, email);
            if (err) throw err;
            if (email) {
                Plan.findOne({ _id: body.plan_id }, { short_name: 1 }, async (err, short_name) => {
                    console.log(err, short_name, body.plan_id);
                    if (err) throw err
                    if (short_name) {
                        var fullUrl = request.protocol + '://' + request.get('host') + request.originalUrl;
                        let html = `
                    <h4><b>Project Invitation (${body.subject})</b></h4>
                    <p>You was invited to :  <b>${short_name.short_name}</b> project</p>
                    <p>${body.message}</p>
                    <a href="${fullUrl}/item-plans-details">please check project list</a>
                    <br><br>
                    <p>--Team</p>
                    `
                        await emailHelper.sendEmail(email, "Project Invitation - RapiFly", html);
                        
                    }

                })
            }
        })

        if (discussion) {
            var discussionId = discussion._id;

            if (request.files && request.files.attachment) {
                var element = request.files.attachment;
                var getTime = new Date().getTime();

                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/module_attachments/' + file_name, element.data, { mode: 0o755 });

                Discussion.updateOne({ _id: discussionId }, { attachment: file_name }, function (error, result) {
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