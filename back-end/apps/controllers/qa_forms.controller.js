const QAForms = require("../models/qa_forms.model");
const CommonHelper = require('../helpers/common.helper');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('../models/user.model');
const asyncl = require('async');

/**
 * This function create reports for goal.
 *
 * @param plan_id, user_id, form_name, form_controls
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-20
 */
exports.create = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.form_name) {
        errors.push(["Form name is required"]);
    }
    if (!body.form_controls) {
        errors.push(["Form controls are required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    var model = JSON.parse(body.form_controls);
    var modelArr = {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            index: true,
            required: true
        },
        created_at: {
            type: Number,
            default: Date.now
        },
    };

    model.forEach((element) => {
        var type = 'String';

        if (element.type == "number") {
            type = 'Number';
        }

        modelArr[element.name] = {
            "type": type, "required": element.required
        }
    });

    try {
        var qaForms = new QAForms(request.body);
        await qaForms.save();

        if (qaForms) {
            var table_name = body.form_name.replace(/ /g, '_');
            table_name = table_name.toLowerCase();
            await CommonHelper.createNewModel(table_name, modelArr)

            return response.send({
                status: true,
                message: "Q/A form has been saved successfully."
            })
        } else {
            return response.send({
                status: false,
                message: "Something went wrong."
            })
        }
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

/**
 * Get all forms of parent user / company.
 *
 * @param parent_user_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-25
 */
exports.getByParentUser = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var planObj = {
            path: 'plan_id'
        };

        var userObj = {
            path: 'user_id'
        };

        QAForms.find({ parent_user_id: body.parent_user_id }).populate(planObj).populate(userObj).exec(function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    data: result
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
 * get form by id.
 *
 * @param form_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-26
 */
exports.getById = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.form_id) {
        errors.push(["Form id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var planObj = {
            path: 'plan_id'
        };

        var userObj = {
            path: 'user_id'
        };

        QAForms.findOne({ _id: body.form_id }).populate(planObj).populate(userObj).exec(function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    data: results
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
 * save qa form values.
 *
 * @param form_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-26
 */
exports.saveQAFormValues = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.form_name) {
        errors.push(["Form name is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var table_name = body.form_name.replace(/ /g, '_');
        table_name = table_name.toLowerCase();

        const db = mongoose.connection;
        var table = db.collection(table_name);

        table.insert(body, function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Form has been saved successfully."
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
 * Get QA form list
 *
 * @param form_name
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-27
 */
exports.getQAFormList = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.form_name) {
        errors.push(["Form name is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var table_name = body.form_name.replace(/ /g, '_');
        table_name = table_name.toLowerCase();

        const db = mongoose.connection;
        var table = db.collection(table_name);

        //Get form_name table details.
        var records = await table.find().toArray();
        if (records && records.length > 0) {
            formValuesArray = [];
            asyncl.each(records, function (element, callback) {
                var data = {};

                //Check element keys and store dynamic key and values in object.
                var keys = Object.keys(element);
                keys.forEach((index) => {
                    if (index != '_id' && index != 'user_id' && index != 'form_name') {
                        data[index] = element[index];
                    }
                });

                // Find user that user has fill-up form.
                var user_id = element.user_id;
                User.findById(user_id, function (error, result) {
                    if (!error && result) {
                        var user_name = result.first_name + ' ' + result.last_name;
                        data.user_name = user_name;

                        // Push user details in array
                        formValuesArray.push(data);
                    }
                    callback();
                });
            }, function () {
                return response.send({
                    status: true,
                    data: formValuesArray
                });
            });
        } else {
            return response.send({
                status: false,
                data: "Details has not been found."
            });
        }
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

/**
 * Get Average Value QA form
 *
 * @param form_name
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-27
 */
exports.getAverageValueOfForm = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.form_name) {
        errors.push(["Form name is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var table_name = body.form_name.replace(/ /g, '_');
        table_name = table_name.toLowerCase();

        const db = mongoose.connection;
        var table = db.collection(table_name);

        //Get form_name table details.
        var records = await table.find().toArray();
        if (records && records.length > 0) {
            var reportsArray = [];
        
            var element = records[0];
            var keys = Object.keys(records[0]);

            keys.forEach((index) => {
                if (index != '_id' && index != 'user_id' && index != 'form_name') {
                    if (typeof element[index] == 'number') {
                        var averageOfColumn = 0;

                        var column = records.map((data) => data[index]);

                        var columnArrayLength = column.length;
                        var totalSumOfArray = column.reduce((a, b) => a + b, 0);

                        averageOfColumn = parseInt(totalSumOfArray) / parseInt(columnArrayLength);
                        
                        var data = {
                            key: index,
                            value: averageOfColumn
                        };
                        reportsArray.push(data);
                    }
                }
            });

            return response.send({
                status: true,
                data: reportsArray
            })
        } else {
            return response.send({
                status: false,
                data: "Details has not been found."
            });
        }
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};