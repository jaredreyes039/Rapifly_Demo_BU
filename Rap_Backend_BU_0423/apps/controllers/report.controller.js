const Reports = require('../models/reports.model');
const Goals = require('../models/goals.model');

const asyncLoop = require('async')

/**
 * This function create reports for goal.
 *
 * @param plan_id, goal_id, user_id, actual_production, actual_expense, report_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-14
 */
exports.create = async function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }
    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
    }
    if (!body.user_id) {
        errors.push(["User id is required"]);
    }
    if (!body.actual_production) {
        errors.push(["Actual production is required"]);
    }
    if (!body.actual_expense) {
        errors.push(["Actual expense id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    // Create a new Reports
    try {
        if (body.report_id) {
            Reports.updateOne({
                _id: body.report_id
            }, {
                actual_production: body.actual_production,
                actual_expense: body.actual_expense,
            }, function(error, report) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    })
                } else {
                    return response.send({
                        status: true,
                        message: "Reports has been updated successfully."
                    })
                }
            });
        } else {
            const report = new Reports({
                plan_id: body.plan_id,
                goal_id: body.goal_id,
                user_id: body.user_id,
                actual_production: body.actual_production,
                actual_expense: body.actual_expense,
            })
            await report.save();

            if (report) {
                return response.send({
                    status: true,
                    message: "Reports has been created successfully."
                })
            } else {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            }
        }
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

/**
 * This function get all goals with reports.
 *
 * @param plan_id, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-14
 */
module.exports.getAllReports = function(request, response) {
    var body = request.body;
    var errors = [];

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
        var userObj = {
            path: 'user_id'
        };

        Goals.find({ plan_id: body.plan_id, is_countdown_update: 1, deactivate: 0 }).populate(userObj).exec(function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (results && results.length > 0) {
                    var goalReportsArr = [];

                    asyncLoop.each(results, function(element, callback) {
                        var data = {};

                        var actual_production = 0;
                        var actual_expense = 0;
                        var report_id = '';

                        Reports.findOne({ goal_id: element._id }, function(error, report) {
                            if (!error && report) {
                                actual_production = report.actual_production;
                                actual_expense = report.actual_expense;
                                report_id = report._id;
                            }
                            data = {
                                element,
                                report_id: report_id,
                                actual_production: actual_production,
                                actual_expense: actual_expense
                            };

                            goalReportsArr.push(data)
                            callback();
                        });
                    }, function(error) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Goal not found."
                            })
                        } else {
                            return response.send({
                                status: true,
                                data: goalReportsArr
                            })
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Goal not found."
                    })
                }
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};