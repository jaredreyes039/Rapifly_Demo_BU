const async1 = require('async');
const fs = require('fs');

const Plan = require('../models/plan.model');
const User = require('../models/user.model');
const Goals = require('../models/goals.model');
const Report = require('../models/reports.model');
const PlanChat = require('../models/plan_chat.model');
const UsersDesignation = require('../models/users_designation.model');
const UserGroups = require('../models/user_groups.model');
const PlanAttachments = require('../models/plan_attachments.model');
const ProblemOpportunity = require('../models/problem_opportunity.model');
const ChallangeAttachments = require('../models/challange_attachments.model');
const ChallangeChats = require('../models/challange_chats.model');

exports.plan_create = async function(request, response) {
    var body = request.body;

    async1.each(request.body.add, function(element, cd2) {
        if (element.type == "text") {
            Plan.schema.add({
                [element.name]: String
            });
        } else if (element.type == "number") {
            // Plan.schema[element.name]= Number;
            Plan.schema.add({
                [element.name]: Number
            });
        } else if (element.type == "select") {
            Plan.schema.add({
                [element.name]: String
            });
        }
    })
    if (body.id == undefined || body.id == '') {
        try {
            const plan = new Plan(request.body)
            await plan.save()
            if (plan) {
                return response.status(201).send({
                    status: true,
                    message: "Plan has been created successfully."
                })
            } else {
                return response.send({
                    status: false,
                    message: "Something went wrong. plan has not been created."
                })
            }
        } catch (err) {
            return response.status(400).send({ status: false, message: err })
        }
    } else {
        if (!body.id && !body.level_name) {
            return response.send({
                status: false,
                message: "Please Enter All required Fields"
            });
        }

        try {
            Plan.updateOne({ _id: body.id }, body, function(error, level) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    })
                } else {
                    return response.status(201).send({
                        status: true,
                        message: "Plan details has been updated."
                    })
                }
            });
        } catch (error) {
            return response.status(400).send({ status: false, message: error })
        }
    }

};

exports.plan_field_remove = async function(request, response) {
    try {
        Plan.schema.add({
            [request.body.name]: String
        });
        Plan.update({}, {
            $unset: {
                [request.body.name]: 1
            }
        }, { multi: true }, function(error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    message: "Plan Form has been updated."
                })
            }
        });
    } catch (error) {
        return response.send({ status: false, message: error })
    }
}
exports.planform_create = async function(request, response) {
    if (request.body[0].userid == undefined) {
        var userid = request.body[0];
        var body = [];
    }
    if (request.body[0].userid != undefined) {
        var userid = request.body[0].userid;
        var body = request.body;
    }
    try {

        User.updateOne({ _id: userid }, {
            palnformfield: body,
        }, function(error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Plan Form has been updated."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
}

exports.get_plan = async function(request, response) {
    try {
        var user_id = request.query.id;

        var obj = {
            path: 'user_id'
        };
        Plan.find({
            $or: [{
                shared_plan_users: user_id
            }, {
                user_id: user_id
            }]
        }).populate(obj).exec(function(error, palns) {
            if (error) {
                console.log(error)
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: palns
                })

            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong." })
    }
};
exports.get_plan_selectbox = async function(request, response) {
    // FETCH PLAN DETAIL FOR PARTICULER USER

    try {
        var obj = {
            path: 'user_id'
        };
        Plan.find({
            status: 0,
            user_id: { $in: request.body.childids },
            security: 1
        }).populate(obj).exec(function(error, palns) {

            if (error) {

                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {

                Plan.find({
                    status: 0,
                    user_id: request.body.id,
                }).populate(obj).exec(function(error, curruntuserpalns) {
                    async1.each(curruntuserpalns, function(element, cd2) {
                        palns.push(element);
                        cd2();
                    }, function() {
                        return response.status(201).send({
                            status: true,
                            data: palns
                        })
                    })
                })

            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};
exports.update_plan = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.level_name) {
        return response.send({
            status: false,
            message: "Please Enter All required Fields"
        });
    }

    try {
        Plan.updateOne({ _id: body.id }, {
            numbers: body.numbers,
            short_name: body.short_name,
            long_name: body.long_name,
            description: body.description,
            start_date: body.start_date,
            end_date: body.end_date,
            security: body.security
        }, function(error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Plan details has been updated."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};
exports.get_plan_by_id2 = async function(request, response) {
    var body = request.body;

    if (!body.plan_id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    try {
        var obj = {
            path: 'user_id'
        };

        Plan.find({ '_id': body.plan_id }, {
            status: 0,
            plan_id: 0,
            created_at: 0,
            __v: 0
        }).populate(obj).exec(function(error, records) {
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
        return response.status(400).send({ status: false, message: error })
    }
};
exports.get_plan_by_id = async function(request, response) {
    var body = request.body;
    if (!body.plan_id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }
    try {
        Plan.findById(body.plan_id, async function(error, plan) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                plan.set("shared_users", [], { strict: false });
                if (plan && plan.shared_permission_users && plan.shared_permission_users.length > 0) {
                    var userObj = {
                        path: 'user_id'
                    };

                    var designationObj = {
                        path: 'hierarchy_id'
                    };

                    await UsersDesignation.find({ user_id: { $in: plan.shared_permission_users } }).populate(userObj).populate(designationObj).exec(function(error, results) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong"
                            })
                        } else {
                            plan.set("shared_users", results, { strict: false });
                            return response.status(201).send({
                                status: true,
                                data: plan
                            })
                        }
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: plan
                    })
                }
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.get_planform_by_id = async function(request, response) {

    var body = request.body;
    if (!body.userid) {
        return response.send({
            status: false,
            message: "User id is required"
        });
    }

    try {
        User.findById(body.userid, function(error, plan) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {

                return response.status(201).send({
                    status: true,
                    data: plan
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
}
exports.updateStatus = async function(request, response) {
    var body = request.body;
    if (!body.id && !body.status) {
        return response.send({
            status: false,
            message: "Plan status and id are required."
        });
    }

    try {
        Plan.updateOne({ _id: body.id }, {
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
                    message: "Plan status has been updated suucessfully."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
};

exports.allchilduser_for_delegate = async function(request, response) {
    var body = request.body;
    if (body.childids && body.childids.length == 0) {
        return response.send({
            status: false,
            message: " Child ids id are required."
        });
    }
    try {
        User.find({ _id: { $in: body.childids } }, {
            first_name: 1,
            last_name: 1
        }, function(error, childuser) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {

                return response.status(201).send({
                    status: true,
                    data: childuser
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error })
    }
}

/**
 * This function return all plans and its goals
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-17
 */
module.exports.getPlanAndGoals = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.fromDate) {
        errors.push(["Start date is required"]);
    }

    if (!body.toDate) {
        errors.push(["End date is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var toDate = parseFloat(new Date(body.toDate).getTime()) - 1000 * 60 * 60;
        var fromDate = parseFloat(new Date(body.fromDate).getTime()) - 1000 * 60 * 60;

        Plan.find({
            user_id: body.user_id,
            created_at: {
                $gte: fromDate,
                $lte: toDate
            }
        }, function(error, plans) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                });
            } else {
                if (plans && plans.length > 0) {
                    var planObject = [];

                    async1.each(plans, function(plan, callback) {
                        Goals.find({ plan_id: plan._id }, async function(error, goalsResult) {
                            var goals = {};
                            var total_expected_target = 0;
                            var total_revenue_target = 0;
                            var actual_expected_target = 0;
                            var actual_revenue_target = 0;
                            var plan_expected = 0;
                            var plan_revenue = 0;

                            if (!error && goalsResult && goalsResult.length > 0) {
                                goals = goalsResult

                                //Calculate total expected target and revenue target of all goals under a plan.
                                total_expected_target = goalsResult.reduce((a, b) => a + parseFloat(b.expected_target), 0);
                                total_revenue_target = goalsResult.reduce((a, b) => a + parseFloat(b.revenue_target), 0);

                                total_expected_target = (total_expected_target) ? total_expected_target : 0;
                                total_revenue_target = (total_revenue_target) ? total_revenue_target : 0;

                                //Find goal's revenue and expected data from report table
                                var goalIds = goalsResult.map(data => data._id);
                                var reports = await Report.find({ goal_id: { $in: goalIds } });

                                if (reports && reports.length > 0) {
                                    //Calculate total actual expected and actual revenue of all goals from report.
                                    actual_expected_target = reports.reduce((a, b) => a + parseFloat(b.actual_expected), 0);
                                    actual_revenue_target = reports.reduce((a, b) => a + parseFloat(b.actual_revenue), 0)

                                    actual_expected_target = (actual_expected_target) ? actual_expected_target : 0;
                                    actual_revenue_target = (actual_revenue_target) ? actual_revenue_target : 0;
                                }
                            }

                            plan_expected = (parseFloat(actual_expected_target) * 100) / parseFloat(total_expected_target);
                            plan_revenue = (parseFloat(actual_revenue_target) * 100) / parseFloat(total_revenue_target);

                            plan_expected = (plan_expected) ? plan_expected : 0;
                            plan_revenue = (plan_revenue) ? plan_revenue : 0;

                            var data = {
                                plan,
                                goal: {
                                    total_expected_target: total_expected_target,
                                    total_revenue_target: total_revenue_target,
                                    actual_expected_target: actual_expected_target,
                                    actual_revenue_target: actual_revenue_target,
                                    plan_expected: plan_expected.toFixed(2),
                                    plan_revenue: plan_revenue.toFixed(2)
                                }
                            };
                            planObject.push(data);
                            callback();
                        });
                    }, function(error) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Plan details has not been found."
                            });
                        } else {
                            return response.send({
                                status: true,
                                data: planObject
                            });
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Plan has not been found."
                    })
                }
            }
        })
    } catch (error) {

        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function return all goals reports by plan
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.getPlanAndGoalsByUser = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.find({ plan_id: body.plan_id }, async function(error, goalsResult) {
            var total_production_target = 0;
            var total_expense_target = 0;
            var actual_production_target = 0;
            var actual_expense_target = 0;
            var plan_production = 0;
            var plan_expense = 0;

            if (!error && goalsResult && goalsResult.length > 0) {
                //Calculate total expected target and revenue target of all goals under a plan.
                total_production_target = goalsResult.reduce((a, b) => a + parseFloat(b.production_target), 0);
                total_expense_target = goalsResult.reduce((a, b) => a + parseFloat(b.expense_target), 0);

                total_production_target = (total_production_target) ? total_production_target : 0;
                total_expense_target = (total_expense_target) ? total_expense_target : 0;

                //Find goal's revenue and expected data from report table
                var goalIds = goalsResult.map(data => data._id);
                await Report.find({ goal_id: { $in: goalIds } }, function(error, reports) {
                    if (!error && reports && reports.length > 0) {
                        //Calculate total actual expected and actual revenue of all goals from report.
                        actual_production_target = reports.reduce((a, b) => a + parseFloat(b.actual_production), 0);
                        actual_expense_target = reports.reduce((a, b) => a + parseFloat(b.actual_expense), 0)

                        actual_production_target = (actual_production_target) ? actual_production_target : 0;
                        actual_expense_target = (actual_expense_target) ? actual_expense_target : 0;
                    }

                    plan_production = (parseFloat(actual_production_target) * 100) / parseFloat(total_production_target);
                    plan_expense = (parseFloat(actual_expense_target) * 100) / parseFloat(total_expense_target);

                    plan_production = (plan_production) ? plan_production : 0;
                    plan_expense = (plan_expense) ? plan_expense : 0;

                    var data = {
                        total_production_target: total_production_target.toFixed(0),
                        total_expense_target: total_expense_target.toFixed(0),
                        actual_production_target: actual_production_target.toFixed(0),
                        actual_expense_target: actual_expense_target.toFixed(0),
                        plan_production: plan_production.toFixed(0),
                        plan_expense: plan_expense.toFixed(0)
                    };

                    return response.send({
                        status: true,
                        data: data
                    });
                });
            } else {
                return response.send({
                    status: false,
                    message: "Goal has not been found."
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function return HUD plan details.
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.getHeadUpToDisplayDetails = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
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

        Plan.findById(body.plan_id).populate(userObj).exec(async function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result) {
                    var plan = result;
                    var data = { plan };

                    var create = 0;
                    var execute = 0;
                    var evalute = 0;

                    //Find select:1 goals, if found then plan is in execute mode otherwise create mode
                    var is_goals_select = await Goals.find({ plan_id: plan._id, select: 1 });

                    if (is_goals_select && is_goals_select.length > 0) {
                        execute = 1;
                        create = 0;
                        evalute = 0;
                    } else {
                        create = 1;
                        execute = 0;
                        evalute = 0;
                    }

                    //Find goals in reports table if found any goal then plan is in evalute mode.
                    var is_report = await Report.find({ plan_id: plan._id });

                    if (is_report && is_report.length > 0) {
                        execute = 0;
                        create = 0;
                        evalute = 1;
                    }

                    data.create = create;
                    data.execute = execute;
                    data.evalute = evalute;

                    return response.send({
                        status: true,
                        data: data
                    })
                } else {
                    return response.send({
                        status: false,
                        message: "Plan details has not been found"
                    });
                }
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function store message that created by user on particular plan.
 *
 * @param plan_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.sendMessage = async function(body) {
    try {
        const planChat = new PlanChat({
            plan_id: body.plan_id,
            sender_id: body.sender_id,
            message: body.message
        });
        await planChat.save();

        if (planChat) {
            if (body.attachments && body.attachments.length > 0) {
                var insertAttachmentObject = [];
                var getTime = new Date().getTime();

                body.attachments.forEach((element, index) => {
                    var name = body.attachment_name[index];

                    //path to store uploaded files (NOTE: presumed you have created the folders)
                    var fileName = './public/chat_attachment/' + name;

                    fs.open(fileName, 'a', 0o755, function(err, fd) {
                        if (err) throw err;

                        fs.write(fd, element, null, 'Binary', function(err, written, buff) {
                            fs.close(fd, function() {
                                console.log('File saved successful!');
                            });
                        })
                    });

                    insertAttachmentObject.push(name);
                });

                await PlanChat.updateOne({ _id: planChat._id }, { attachments: insertAttachmentObject });
            }

            return planChat;
        }
    } catch (error) {
        return '';
    }
};

/**
 * This function store message that created by user on particular plan.
 *
 * @param plan_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.checkPlanUserPermission = function(request, response) {
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
        Plan.find({ shared_permission_users: body.user_id }, function(error, results) {
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
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};
/**
 * This function update plan details.
 *
 * @param plan_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.updateUsersDetails = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Plan id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Plan.updateOne({
            _id: body.id
        }, {
            user_group_id: body.users_group_id,
            share_users: body.share_users,
            shared_plan_users: body.shared_plan_to_users,
        }, function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "Plan has been shared to selected user(s) successfully."
                });
            }
        });
    } catch (error) {
        console.log(error)
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function update plan details.
 *
 * @param plan_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.updatePlanDescription = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Plan id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Plan.updateOne({
            _id: body.id
        }, {
            description: body.description,
        }, function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "Description has been updated successfully."
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function update plan details.
 *
 * @param plan_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.updatePlanMotivation = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["Plan id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Plan.updateOne({
            _id: body.id
        }, {
            motivation: body.motivation,
        }, function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "Motivation has been updated successfully."
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

exports.get_single_plan = async function(request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    try {
        Plan.findById(body.id, async function(error, plan) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (plan) {
                    plan.set("selected_users", [], { strict: false });
                    plan.set("selected_user_group", '', { strict: false });

                    if (plan.user_group_id && plan.user_group_id != null && plan.user_group_id != undefined) {
                        var userGroups = await UserGroups.find({ _id: { $in: plan.user_group_id } });
                        if (userGroups) {
                            plan.set("selected_user_group", userGroups, { strict: false });
                        }
                    }

                    if (plan.share_users && plan.share_users.length > 0) {
                        var userObj = {
                            path: 'user_id'
                        };

                        var designationObj = {
                            path: 'hierarchy_id'
                        };

                        var share_users = JSON.parse(JSON.stringify(plan.share_users));

                        await UsersDesignation.find({ user_id: { $in: share_users } }).populate(userObj).populate(designationObj).exec(function(error, results) {
                            if (!error && results && results.length > 0) {
                                plan.set("selected_users", results, { strict: false });

                                return response.send({
                                    status: true,
                                    data: plan
                                })
                            } else {
                                return response.send({
                                    status: true,
                                    data: plan
                                })
                            }
                        });
                    } else {
                        return response.send({
                            status: true,
                            data: plan
                        })
                    }
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

/**
 * This function store plan attachments.
 *
 * @param plan_id, user_id, attachment
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-02
 */
exports.storePlanAttachments = async function(request, response) {
    var body = request.body;

    if (!body.plan_id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    if (!body.user_id) {
        return response.send({
            status: false,
            message: "User id is required"
        });
    }

    if (!request.files.attachments) {
        return response.send({
            status: false,
            message: "File is required"
        });
    }

    try {
        var attachments = request.files.attachments;

        var user_id = body.user_id;
        var plan_id = body.plan_id;
        var getTime = new Date().getTime();

        var is_Array = Array.isArray(attachments);

        if (is_Array == true && attachments.length > 0) {
            var insertAttachmentObject = [];

            attachments.forEach(element => {
                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/plan_attachments/' + file_name, element.data, { mode: 0o755 });

                var data = {
                    attachment: file_name,
                    user_id: user_id,
                    plan_id: plan_id
                };

                insertAttachmentObject.push(data);
            });

            if (insertAttachmentObject && insertAttachmentObject.length > 0) {
                PlanAttachments.insertMany(insertAttachmentObject, function(error, result) {
                    if (error) {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        })
                    } else {
                        return response.send({
                            status: true,
                            message: "Attachment has been saved successfully."
                        })
                    }
                });
            }
        } else if (attachments) {
            var element = attachments;
            var file_name = getTime + '-' + element.name;
            fs.writeFileSync('./public/plan_attachments/' + file_name, element.data);

            var data = {
                attachment: file_name,
                user_id: user_id,
                plan_id: plan_id
            };

            var planAttachments = new PlanAttachments(data);
            planAttachments.save();

            if (planAttachments) {
                return response.send({
                    status: true,
                    message: "Attachment has been saved successfully."
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
 * This function get plan attachments.
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-02
 */
exports.getPlanAttachments = async function(request, response) {
    var body = request.body;

    if (!body.plan_id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    try {
        var site_url = request.protocol + '://' + request.get('host');
        var plan_id = body.plan_id;

        PlanAttachments.find({ plan_id: plan_id }, function(error, attachments) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                var attachmentArr = [];

                if (attachments && attachments.length > 0) {
                    attachments.forEach((element, index) => {
                        if (element.attachment) {
                            var file_name = element.attachment;
                            var image = site_url + '/plan_attachments/' + file_name;
                            element.set("attachment_url", image, { strict: false });
                            attachmentArr.push(element);
                        }
                    });
                }

                return response.send({
                    status: true,
                    data: attachmentArr
                });
            }
        })
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

/**
 * This function remove attachment from plan
 *
 * @param plan_attachment_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-02
 */
module.exports.deleteGoalAttachment = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_attachment_id) {
        errors.push(["Plan attachment id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        PlanAttachments.deleteOne({ _id: body.plan_attachment_id }, function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "File has been deleted successfully."
                });
            }
        })
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * Get plan chat
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-03
 */
module.exports.getPlanChat = function(request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
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
            path: 'sender_id'
        }

        PlanChat.find({ plan_id: body.plan_id }).sort({ "created_at": 1 }).populate(userObj).exec(function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                let chatArr = [];

                if (results && results.length > 0) {
                    results.forEach((element, index) => {
                        var image = '';
                        var chat_attachment = '';
                        var data = {
                            _id: element._id,
                            sender_id: element.sender_id._id,
                            sender_name: `${element.sender_id.first_name} ${element.sender_id.last_name}`,
                            message: element.message,
                            created_at: element.created_at
                        };

                        if (element.sender_id.avatar) {
                            var file_name = element.sender_id.avatar;
                            image = site_url + '/avatars/' + file_name;
                        }

                        var chatAttachments = [];
                        if (element.attachments && element.attachments.length > 0) {
                            element.attachments.forEach((result) => {
                                var file_name = result;
                                var chat_attachment = site_url + '/chat_attachment/' + file_name;

                                var data = {
                                    file_name: file_name,
                                    url: chat_attachment
                                };
                                chatAttachments.push(data);
                            })
                        }

                        data.avatar_url = image;
                        data.chat_attachment_urls = chatAttachments;

                        chatArr.push(data);
                    });
                }

                return response.send({
                    status: true,
                    data: chatArr
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * Get plan chat
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-03
 */
module.exports.getPlanSingleChat = function(request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body._id) {
        errors.push(["id is required"]);
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
            path: 'sender_id'
        }

        PlanChat.findById(body._id).populate(userObj).exec(function(error, element) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                let data = {};

                if (element) {
                    var image = '';
                    var chat_attachment = '';
                    data = {
                        _id: element._id,
                        sender_id: element.sender_id._id,
                        sender_name: `${element.sender_id.first_name} ${element.sender_id.last_name}`,
                        message: element.message,
                        created_at: element.created_at
                    };

                    if (element.sender_id.avatar) {
                        var file_name = element.sender_id.avatar;
                        image = site_url + '/avatars/' + file_name;
                    }

                    var chatAttachments = [];

                    if (element.attachments && element.attachments.length > 0) {
                        element.attachments.forEach((result) => {
                            var file_name = result;
                            var chat_attachment = site_url + '/chat_attachment/' + file_name;

                            var data = {
                                file_name: file_name,
                                url: chat_attachment
                            };
                            chatAttachments.push(data);
                        })
                    }

                    data.avatar_url = image;
                    data.chat_attachment_urls = chatAttachments;
                }

                return response.send({
                    status: true,
                    data: data
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * Store opportuniy and problem
 *
 * @param plan_id, opportuniy, problem
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-19
 */
module.exports.storeOpportuniyAndProblem = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.challange) {
        errors.push(["Challange is required"]);
    }

    if (!body.description) {
        errors.push(["Description is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var problemOpportunity = new ProblemOpportunity(body);
        problemOpportunity.save();

        if (problemOpportunity) {
            return response.send({
                status: true,
                message: "Opportunity and problem has been saved successfully."
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
        });
    }
}

/**
 * get opportuniy and problem
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-19
 */
module.exports.getOpportuniyAndProblem = function(request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
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

        ProblemOpportunity.find({ plan_id: body.plan_id }).sort({ "created_at": 1 }).populate(userObj).exec(function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (results && results.length > 0) {
                    results.forEach((element, index) => {
                        var image = '';

                        if (element.user_id.avatar) {
                            var file_name = element.user_id.avatar;
                            image = site_url + '/avatars/' + file_name;
                        }

                        element.set("avatar_url", image, { strict: false });
                    });
                }

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
}

/**
 * get user plans
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-20
 */
module.exports.getUserPlans = function(request, response) {
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
        Plan.find({ user_id: body.user_id }).exec(function(error, results) {
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
}

/**
 * This function store challange attachment
 *
 * @param challange_id, file.attachments
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-24
 */
module.exports.storeChallangeAttachments = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.challange_id) {
        errors.push(["Challange id is required"]);
    }

    if (!request.files.attachments) {
        errors.push(["File is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var attachments = request.files.attachments;

        var challange_id = body.challange_id;
        var getTime = new Date().getTime();

        var is_Array = Array.isArray(attachments);

        if (is_Array == true && attachments.length > 0) {
            var insertAttachmentObject = [];

            attachments.forEach(element => {
                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/challange_attachments/' + file_name, element.data, { mode: 0o755 });

                var data = {
                    attachment: file_name,
                    challange_id: challange_id
                };

                insertAttachmentObject.push(data);
            });

            if (insertAttachmentObject && insertAttachmentObject.length > 0) {
                ChallangeAttachments.insertMany(insertAttachmentObject, function(error, result) {
                    if (error) {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        })
                    } else {
                        return response.send({
                            status: true,
                            message: "Attachment has been saved successfully."
                        })
                    }
                });
            }
        } else if (attachments) {
            var element = attachments;
            var file_name = getTime + '-' + element.name;
            fs.writeFileSync('./public/challange_attachments/' + file_name, element.data);

            var data = {
                attachment: file_name,
                challange_id: challange_id
            };

            var challangeAttachments = new ChallangeAttachments(data);
            challangeAttachments.save();

            if (challangeAttachments) {
                console.log(challangeAttachments)
                return response.send({
                    status: true,
                    message: "Attachment has been saved successfully."
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
        });
    }
}

/**
 * This function get challange attachments
 *
 * @param challange_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-24
 */
module.exports.getChallangeAttachments = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.challange_id) {
        errors.push(["Challange id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var site_url = request.protocol + '://' + request.get('host');

        ChallangeAttachments.find({ challange_id: body.challange_id }, function(error, attachments) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                var attachmentArr = [];

                if (attachments && attachments.length > 0) {
                    attachments.forEach((element, index) => {
                        if (element.attachment) {
                            var file_name = element.attachment;
                            var image = site_url + '/challange_attachments/' + file_name;
                            element.set("attachment_url", image, { strict: false });
                            attachmentArr.push(element);
                        }
                    });
                }

                return response.send({
                    status: true,
                    data: attachmentArr
                });
            }
        })
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * This function remove attachment from challange
 *
 * @param challange_attachment_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-24
 */
module.exports.deleteChallangeAttachment = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.challange_attachment_id) {
        errors.push(["Challange attachment id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        ChallangeAttachments.deleteOne({ _id: body.challange_attachment_id }, function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "File has been deleted successfully."
                });
            }
        })
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * This function store message that send by user on particular strategy.
 *
 * @param challange_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.sendChallangeMessage = async function(body) {
    try {
        const challangeChat = new ChallangeChats({
            challange_id: body.challange_id,
            sender_id: body.sender_id,
            message: body.message
        });
        await challangeChat.save();

        if (challangeChat) {
            if (body.attachments && body.attachments.length > 0) {
                var insertAttachmentObject = [];
                var getTime = new Date().getTime();

                body.attachments.forEach((element, index) => {
                    var name = body.attachment_name[index];

                    //path to store uploaded files
                    var fileName = './public/chat_attachment/' + name;

                    fs.open(fileName, 'a', 0o755, function(err, fd) {
                        if (err) throw err;

                        fs.write(fd, element, null, 'Binary', function(err, written, buff) {
                            fs.close(fd, function() {
                                console.log('File saved successful!');
                            });
                        })
                    });

                    insertAttachmentObject.push(name);
                });

                await ChallangeChats.updateOne({ _id: challangeChat._id }, { attachments: insertAttachmentObject });
            }

            return challangeChat;
        }
    } catch (error) {
        return '';
    }
};

/**
 * Get challange single chat
 *
 * @param challange_chat_id (id)
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-24
 */
module.exports.getChallangeSingleChat = function(request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body._id) {
        errors.push(["id is required"]);
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
            path: 'sender_id'
        }

        ChallangeChats.findById(body._id).populate(userObj).exec(function(error, element) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                let data = {};

                if (element) {
                    var image = '';
                    var chat_attachment = '';
                    data = {
                        _id: element._id,
                        sender_id: element.sender_id._id,
                        sender_name: `${element.sender_id.first_name} ${element.sender_id.last_name}`,
                        message: element.message,
                        created_at: element.created_at
                    };

                    if (element.sender_id.avatar) {
                        var file_name = element.sender_id.avatar;
                        image = site_url + '/avatars/' + file_name;
                    }

                    var chatAttachments = [];

                    if (element.attachments && element.attachments.length > 0) {
                        element.attachments.forEach((result) => {
                            var file_name = result;
                            var chat_attachment = site_url + '/chat_attachment/' + file_name;

                            var data = {
                                file_name: file_name,
                                url: chat_attachment
                            };
                            chatAttachments.push(data);
                        })
                    }

                    data.avatar_url = image;
                    data.chat_attachment_urls = chatAttachments;
                }

                return response.send({
                    status: true,
                    data: data
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * Get challange chats
 *
 * @param challange_id
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-24
 */
module.exports.getChallangeChat = function(request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.challange_id) {
        errors.push(["Challange id is required"]);
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
            path: 'sender_id'
        }

        ChallangeChats.find({ challange_id: body.challange_id }).sort({ "created_at": 1 }).populate(userObj).exec(function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                let chatArr = [];

                if (results && results.length > 0) {
                    results.forEach((element, index) => {
                        var image = '';
                        var chat_attachment = '';
                        var data = {
                            _id: element._id,
                            sender_id: element.sender_id._id,
                            sender_name: `${element.sender_id.first_name} ${element.sender_id.last_name}`,
                            message: element.message,
                            created_at: element.created_at
                        };

                        if (element.sender_id.avatar) {
                            var file_name = element.sender_id.avatar;
                            image = site_url + '/avatars/' + file_name;
                        }

                        var chatAttachments = [];
                        if (element.attachments && element.attachments.length > 0) {
                            element.attachments.forEach((result) => {
                                var file_name = result;
                                var chat_attachment = site_url + '/chat_attachment/' + file_name;

                                var data = {
                                    file_name: file_name,
                                    url: chat_attachment
                                };
                                chatAttachments.push(data);
                            })
                        }

                        data.avatar_url = image;
                        data.chat_attachment_urls = chatAttachments;

                        chatArr.push(data);
                    });
                }

                return response.send({
                    status: true,
                    data: chatArr
                });
            }
        });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}