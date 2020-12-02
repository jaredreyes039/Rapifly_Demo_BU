const fs = require('fs');
const async1 = require("async");
const moment = require('moment');

const Goals = require("../models/goals.model");
const Strategies = require("../models/strategies.model");
const Plan = require("../models/plan.model");
const GoalAlert = require('../models/goal_alert.model');
const Reports = require('../models/reports.model');
const User = require('../models/user.model');
const Delegation = require('../models/delegation.model');
const GoalAttachment = require('../models/goal_attachments.model');
const UserDesignation = require('../models/users_designation.model');
const GoalChat = require('../models/goal_chat.model');
const StrategyAttachments = require('../models/strategy_attachments.model');
const StrategyChats = require('../models/strategy_chats.model');
const Discussions = require('../models/discussion.model');

var _ = require('lodash');

exports.create = async function (request, response) {
    var body = request.body;
    var files = request.files;

    body.shared_users = (body.shared_users && body.shared_users != undefined) ? body.shared_users.split(',') : [];

    if (body.controls && body.controls.length > 0) {
        async1.each(body.controls, function (element, cd2) {
            if (element.type == "text") {
                Goals.schema.add({
                    [element.name]: String
                });
            } else if (element.type == "number") {
                // Plan.schema[element.name]= Number;
                Goals.schema.add({
                    [element.name]: Number
                });
            } else if (element.type == "select") {
                Goals.schema.add({
                    [element.name]: String
                });
            }
        })
    }

    Goals.find({ plan_id: body.plan_id }, async (err, res) => {
        if (err) throw err;
        if (res) {
            if (res.length == 0) {
                request.body.prioritize = 1;
            } else {
                request.body.prioritize = res[0].prioritize + 1;
            }
            if (body.editid == undefined || body.editid == "") {
                try {
                    const goal = new Goals(request.body);
                    await goal.save();
                    if (goal) {
                        var goal_id = goal._id;
                        if (files && files.attachments) {
                            await storeAttachments(goal_id, files.attachments);
                        }

                        return response.status(201).send({
                            status: true,
                            message: "Goal has been created successfully."
                        });
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong. plan has not been created."
                        });
                    }
                } catch (err) {
                    return response.status(400).send({ status: false, message: err });
                }
            } else {
                if (!body.editid) {
                    return response.send({
                        status: false,
                        message: "Please Enter All required Fields"
                    });
                }

                try {
                    Goals.updateOne({ _id: body.editid }, body, async function (error, level) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            if (files && files.attachments) {
                                await storeAttachments(body.editid, files.attachments);
                            }

                            return response.status(201).send({
                                status: true,
                                message: "Goal details has been updated."
                            });
                        }
                    });
                } catch (error) {
                    return response.status(400).send({ status: false, message: error });
                }
            }
        }
    }).sort({ prioritize: -1 }).limit(1);

    function storeAttachments(goal_id, attachments) {
        var is_Array = Array.isArray(attachments);
        var getTime = new Date().getTime();

        if (is_Array == true && attachments.length > 0) {
            var insertAttachmentObject = [];

            attachments.forEach(element => {
                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/goals_attachments/' + file_name, element.data);

                var data = {
                    attachment: file_name,
                    goal_id: goal_id
                };

                insertAttachmentObject.push(data);
            });

            if (insertAttachmentObject && insertAttachmentObject.length > 0) {
                GoalAttachment.insertMany(insertAttachmentObject);
            }
        } else if (attachments) {
            var element = attachments;
            var file_name = getTime + '-' + element.name;
            fs.writeFileSync('./public/goals_attachments/' + file_name, element.data);

            var data = {
                attachment: file_name,
                goal_id: goal_id
            };

            var goalAttachment = new GoalAttachment(data);
            goalAttachment.save();
        }
    }
};

exports.get_plan_goal_tree = async function (request, response) {
    //get plan tree in brainstrom phase
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "User id is required"
        });
    }
    try {
        Plan.find({ status: 0, user_id: request.body.id }, { short_name: 1 }, (err, plans) => {
            if (err) throw err;
            if (plans) {
                async1.each(plans, function (element, cd2) {
                    Goals.find({ plan_id: element._id, deactivate: 0 }, {}, (err2, goal) => {
                        if (err) throw err;
                        if (goal) {
                            element.set("goals", goal, { strict: false });
                            cd2();
                        } else {
                            cd2();
                        }
                    });
                }, function (err) {
                    Plan.find({
                        security: 1,
                        status: 0,
                        user_id: { $in: request.body.childids }
                    }, { short_name: 1 }, (err, childplans) => {
                        if (err) throw err;
                        if (childplans) {
                            async1.each(childplans, function (element2, cd3) {
                                Goals.find({
                                    plan_id: element2._id,
                                }, {}, (err2, goalchild) => {
                                    if (err2) throw err2;
                                    if (goalchild) {
                                        element2.set("goals", goalchild, {
                                            strict: false
                                        });
                                        cd3();
                                    } else {
                                        cd3();
                                    }
                                });
                            }, function (err) {
                                Discussions.find({
                                    "$or": [{
                                        security: 'public',
                                        user_id: { $in: request.body.childids }
                                    }, {
                                        security: 'private',
                                        recipient_id: request.body.id
                                    }, {
                                        security: 'public',
                                        recipient_id: request.body.id
                                    }]
                                }, { security: 1, plan_id: 1, created_at: 1 }, { sort: { 'created_at': -1 } }, (err, discussionPlanIds) => {
                                    if (err) throw err;
                                    if (discussionPlanIds) {
                                        var tempDiscussionPlanIds = [];
                                        discussionPlanIds = discussionPlanIds.filter(elem => {
                                            const id = elem.plan_id.toString();
                                            if (tempDiscussionPlanIds.indexOf(id) === -1) {
                                                tempDiscussionPlanIds.push(id);
                                                return true;
                                            }
                                        });

                                        async1.each(discussionPlanIds, function (ele, cd4) {
                                            Plan.find({ status: 0, _id: ele.plan_id }, {short_name: 1}, (err, plan) => {
                                                if (err) throw err;
                                                if (plan && plan.length > 0) {
                                                    console.log(plan);
                                                    ele.set("short_name", plan[0].short_name, { strict: false });
                                                    cd4();
                                                } else {
                                                    cd4();
                                                }
                                            });
                                        }, function (err) {
                                            async1.each(discussionPlanIds, function (ele, cd5) {
                                                Goals.find({ plan_id: ele.plan_id, deactivate: 0 }, {}, (err, goal) => {
                                                    if (err) throw err;
                                                    if (goal) {
                                                        ele.set("goals", goal, { strict: false });
                                                        cd5();
                                                    } else {
                                                        cd5();
                                                    }
                                                });
                                            }, async function (err) {
                                                var children = plans.concat(childplans.concat(discussionPlanIds));

                                                var planObj = {
                                                    path: 'plan_id'
                                                };

                                                await Goals.find({ shared_users: request.body.id }).populate(planObj).exec(function (error, results) {
                                                    if (!error && results && results.length > 0) {
                                                        async1.each(results, function (element, callback) {
                                                            var plan = element.plan_id;
                                                            var childKey = children.map(data => data._id);

                                                            if (childKey.includes(plan._id) == true) {
                                                                var index = childKey.indexOf(plan._id);
                                                                children[index].goals.push(element);
                                                            } else {
                                                                var data = {
                                                                    _id: plan._id,
                                                                    short_name: plan.short_name,
                                                                    goals: [element]
                                                                };

                                                                children.push(data);
                                                            }
                                                        });
                                                        return response.send({
                                                            status: true,
                                                            data: children
                                                        })
                                                    } else {
                                                        return response
                                                            .status(200)
                                                            .send({ status: true, data: children });
                                                    }
                                                });
                                            })
                                        })
                                    }
                                })
                            });
                        }
                    });
                });
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_all_goals_by_plan = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    if (!body.module_type) {
        return response.send({
            status: false,
            message: "Module type is required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        Goals.find({ plan_id: body.id, module_type: body.module_type })
            .populate(obj)
            .sort({ prioritize: 1 })
            .exec(function (error, goal) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: goal
                    });
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_goals_by_planid = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Plan id is required"
        });
    }

    if (!body.module_type) {
        return response.send({
            status: false,
            message: "Module type is required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        Goals.find({ plan_id: body.id, module_type: body.module_type, deactivate: 0 })
            .populate(obj)
            .sort({ prioritize: 1 })
            .exec(function (error, goal) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: goal
                    });
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};
exports.get_goal_by_id = async function (request, response) {
    var body = request.body;
    if (!body.goal_id) {
        return response.send({
            status: false,
            message: "goal id is required"
        });
    }

    try {
        Goals.findById(body.goal_id, function (error, goal) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong. Role has not been created."
                });
            } else {
                return response.status(201).send({
                    status: true,
                    data: goal
                });
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

/**
 * This function update and manage goal priority by plan.
 *
 * @param goal_id, plan_id, current_priority, new_priority
 * @author  Hardik Gadhiya [Modified]
 * @version 1.0
 * @since   2020-02-20
 */
exports.priority_change_by_id = async function (request, response) {

    //Modified code
    var body = request.body;
    var errors = [];

    console.log(body)

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
    }

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.current_priority) {
        errors.push(["Current priority is required"]);
    }

    if (!body.new_priority) {
        errors.push(["New priority is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.findOne({ prioritize: body.new_priority, plan_id: body.plan_id }, async function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result) {
                    await Goals.updateOne({ _id: body.goal_id }, { prioritize: result.prioritize }, async function (error, is_update_current_goal) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Can not update priority in selected goal."
                            });
                        } else {
                            await Goals.updateOne({ _id: result._id }, { prioritize: body.current_priority }, function (error, is_update_new_goal) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Can not update priority in next goal."
                                    });
                                } else {
                                    return response.send({
                                        status: true,
                                        message: "Goal priority has been updated successfully"
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Goal not found."
                    });
                }
            }
        });

        //Old code before 20 -02-2020
        // Goals.updateOne({ _id: body.id }, body, function (error, level) {
        //     if (error) {
        //         return response.send({
        //             status: false,
        //             message: "Something went wrong."
        //         });
        //     } else {
        //         return response.send({
        //             status: true,
        //             message: "Goal priority has been updated."
        //         });
        //     }
        // });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.deactivate_change_by_id = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "goal id is required"
        });
    }

    try {
        Goals.updateOne({ _id: body.id }, body, function (error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (body.deactivate == 1) {
                    return response.status(201).send({
                        status: true,
                        message: "Goal Deactivated Successfully."
                    });
                } else if (body.deactivate == 0) {
                    return response.status(201).send({
                        status: true,
                        message: "Goal Activated Successfully."
                    });
                }
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.propose_change_by_id = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "goal id is required"
        });
    }

    try {
        Goals.updateOne({ _id: body.id }, body, function (error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (body.propose == 1) {
                    return response.status(201).send({
                        status: true,
                        message: "Goal send  team page for votting."
                    });
                } else if (body.propose == 0) {
                    return response.status(201).send({
                        status: true,
                        message: "Goal Proposal cancel Successfully."
                    });
                }
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_goals_by_vote = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    if (!body.module_type) {
        return response.send({
            status: false,
            message: "Module type is required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        var planObj = {
            path: "plan_id"
        };
        Goals.find({ plan_id: body.id, module_type: body.module_type, propose: 1, deactivate: 0 })
            .populate(obj)
            .populate(planObj)
            .sort({ prioritize: 1 })
            .exec(function (error, goal) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: goal
                    });
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_goals_by_vote_all_plan = async function (request, response) {
    var body = request.body;

    if (!body.planIds) {
        return response.send({
            status: false,
            message: "Plan ids are required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        var planObj = {
            path: "plan_id"
        };
        Goals.find({ plan_id: { $in: body.planIds }, propose: 1, deactivate: 0 })
            .populate(obj)
            .populate(planObj)
            .sort({ prioritize: 1 })
            .exec(function (error, goal) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: goal
                    });
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_goals_by_delegate = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    if (!body.module_type) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        Goals.find({ plan_id: body.id, module_type: body.module_type, select: 1, deactivate: 0 })
            .populate(obj)
            .sort({ prioritize: 1 })
            .exec(function (error, goals) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    if (goals && goals.length > 0) {
                        var goalsArr = [];

                        async1.each(goals, function (element, callback) {
                            var goal_id = element._id;

                            Delegation.find({ goal_id: goal_id, is_accept: 1 }, function (error, result) {
                                var delegate_percentage = 0;

                                if (!error && result && result.length > 0) {
                                    delegate_percentage = result.reduce((a, b) => a + parseFloat(b.percentage), 0);
                                }

                                element.set("delegate_percentage", delegate_percentage, { strict: false });
                                goalsArr.push(element);
                                callback();
                            })
                        }, function (error) {
                            return response.send({
                                status: true,
                                data: goalsArr
                            });
                        })
                    } else {
                        return response.send({
                            status: true,
                            data: []
                        });
                    }
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

exports.get_goals_by_countdown = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    if (!body.module_type) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    try {
        var obj = {
            path: "user_id"
        };
        Goals.find({ plan_id: body.id, module_type: body.module_type, is_countdown_update: 1, deactivate: 0 })
            .populate(obj)
            .sort({ prioritize: 1 })
            .exec(function (error, goal) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong. Role has not been created."
                    });
                } else {
                    return response.send({
                        status: true,
                        data: goal
                    });
                }
            });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};
exports.voteupdown_by_id = async function (request, response) {
    var body = request.body;
    console.log(body);

    if (!body.id) {
        return response.send({
            status: false,
            message: "Goal id is required"
        });
    }

    Goals.findOne({
        _id: body.id
    },
        function (err, res) {
            if (err) throw err;
            if (res) {
                if (res.voteup.includes(body.userid) == true || res.votedown.includes(body.userid) == true) {
                    return response.send({
                        status: false,
                        message: "You have already voted for this goal"
                    });
                }

                if (body.vote == "up") {
                    try {
                        var newvalues = { $push: { voteup: body.userid } };
                        Goals.updateOne({ _id: body.id }, newvalues, function (
                            error,
                            level
                        ) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                return response.status(201).send({
                                    status: true,
                                    message: "Vote up Give Successfully."
                                });
                            }
                        });
                    } catch (error) {
                        return response
                            .status(400)
                            .send({ status: false, message: error });
                    }
                } else if (body.vote == "down") {
                    try {
                        var newvalues = { $push: { votedown: body.userid } };
                        Goals.updateOne({ _id: body.id }, newvalues, function (
                            error,
                            level
                        ) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                return response.status(201).send({
                                    status: true,
                                    message: "Vote Down Give Successfully."
                                });
                            }
                        });
                    } catch (error) {
                        return response
                            .status(400)
                            .send({ status: false, message: error });
                    }

                }
            }
        }
    );
};
exports.updateselect = async function (request, response) {
    var body = request.body;
    if (body.security == 0) {
        if (body.select == 1) {
            var CountDown = new Date().getTime();
        }
        if (body.select == 0) {
            var CountDown = 0;
        }
        if (!body.id) {
            return response.send({
                status: false,
                message: "Goal id is required."
            });
        }

        try {
            Goals.updateOne({ _id: body.id }, {
                select: body.select,
                countdown: CountDown,
                is_countdown_update: 1

            },
                function (error, domain) {
                    if (error) {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        });
                    } else {
                        if (body.select == 1) {
                            return response.status(201).send({
                                status: true,
                                message: "Goal has been Selected "
                            });
                        } else if (body.select == 0) {
                            return response.status(201).send({
                                status: true,
                                message: "Goal has been removed from selected goals ."
                            });
                        }
                    }
                }
            );
        } catch (error) {
            return response.status(400).send({ status: false, message: error });
        }
    } else if (body.security == 1) {
        if (!body.id) {
            return response.send({
                status: false,
                message: "Goal id is required."
            });
        }
        try {
            Goals.updateOne({ _id: body.id }, {
                select: body.select
            },
                function (error, domain) {
                    if (error) {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        });
                    } else {
                        if (body.select == 1) {
                            return response.status(201).send({
                                status: true,
                                message: "Goal has been Selected "
                            });
                        } else if (body.select == 0) {
                            return response.status(201).send({
                                status: true,
                                message: "Goal has been removed from selected goals ."
                            });
                        }
                    }
                }
            );
        } catch (error) {
            return response.status(400).send({ status: false, message: error });
        }
    } else { }
};

/**
 * This function return all goals and proposal goals of user and plan.
 *
 * @param user_id
 * @author  Jaydeep Lathiya
 * @version 1.0
 * @since   2020-02-13
 */

module.exports.launchgoal = function (request, response) {
    try {
        console.log(new Date());

        GoalAlert.find({
            user_id: request.body.user_id,
            date: new Date()
        }, function (error, record) {
            console.log(record);

        });
    } catch (error) {
        console.log(error)
    }
};

/**
 * This function return goal report by superior.
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-18
 */
module.exports.getGoalReportByUser = function (request, response) {
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
        var data = {};
        var currentDate = Math.round(new Date().getTime());

        Goals.find({ user_id: body.user_id }, function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                });
            } else {
                if (results && results.length > 0) {
                    //Calculate Total Goals
                    data.total_goals = results.length;
                    var completed_goals = 0;
                    var remaining_goals = 0;
                    var overdue_goals = 0;

                    async1.each(results, function (element, callback) {
                        Reports.find({ goal_id: element._id }, function (error, reports) {
                            if (!error && reports && reports.length > 0) {
                                //Calculate completed goals
                                completed_goals += 1;
                            } else {
                                var end_date = Math.round(new Date(element.end_date).getTime());

                                if (end_date > currentDate) {
                                    //Calculate remaining goals
                                    remaining_goals += 1;
                                }

                                if (end_date < currentDate) {
                                    //Calculate overdue goals
                                    overdue_goals += 1;
                                }
                            }
                            callback();
                        });
                    }, function (error) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong"
                            });
                        } else {
                            data.completed_goals = completed_goals;
                            data.remaining_goals = remaining_goals;
                            data.overdue_goals = overdue_goals;

                            return response.send({
                                status: true,
                                data: data
                            })
                        }
                    })
                } else {
                    return response.send({
                        status: false,
                        message: "Details has not been found"
                    })
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
 * This function return goal report by admin.
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-18
 */
module.exports.getGoalReportByAdmin = function (request, response) {
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
        //Find users of parent user id (by organization)
        User.find({ parent_user_id: body.user_id }, { _id: 1 }, function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                });
            } else {
                if (results && results.length > 0) {
                    var data = {};
                    var currentDate = Math.round(new Date().getTime());

                    var userIds = results.map(data => data._id);

                    Goals.find({ user_id: { $in: userIds } }, function (error, results) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong"
                            });
                        } else {
                            if (results && results.length > 0) {
                                //Calculate Total Goals
                                data.total_goals = results.length;
                                var completed_goals = 0;
                                var remaining_goals = 0;
                                var overdue_goals = 0;

                                async1.each(results, function (element, callback) {
                                    Reports.find({ goal_id: element._id }, function (error, reports) {
                                        if (!error && reports && reports.length > 0) {
                                            //Calculate completed goals
                                            completed_goals += 1;
                                        } else {
                                            var end_date = Math.round(new Date(element.end_date).getTime());

                                            if (end_date > currentDate) {
                                                //Calculate remaining goals
                                                remaining_goals += 1;
                                            }

                                            if (end_date < currentDate) {
                                                //Calculate overdue goals
                                                overdue_goals += 1;
                                            }
                                        }
                                        callback();
                                    });
                                }, function (error) {
                                    if (error) {
                                        return response.send({
                                            status: false,
                                            message: "Something went wrong"
                                        });
                                    } else {
                                        data.completed_goals = completed_goals;
                                        data.remaining_goals = remaining_goals;
                                        data.overdue_goals = overdue_goals;

                                        return response.send({
                                            status: true,
                                            data: data
                                        })
                                    }
                                })
                            } else {
                                return response.send({
                                    status: false,
                                    message: "Details has not been found"
                                })
                            }
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Users not found."
                    })
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
 * This function update goal prioroty
 *
 * @param goal_id, priority
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.updateGoalPrioroty = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
    }

    if (!body.prioritize) {
        errors.push(["Priority is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.updateOne({ _id: body.goal_id }, { prioritize: body.prioritize }, function (error, is_update) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    message: "Goal priority has been updated successfully."
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
 * This function get goal attachments
 *
 * @param goal_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.getGoalAttachments = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
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

        GoalAttachment.find({ goal_id: body.goal_id }, function (error, attachments) {
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
                            var image = site_url + '/goals_attachments/' + file_name;
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
 * This function remove attachment from goal
 *
 * @param goal_attachment_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.deleteGoalAttachment = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.goal_attachment_id) {
        errors.push(["Goal attachment id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        GoalAttachment.deleteOne({ _id: body.goal_attachment_id }, function (error, result) {
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
 * This function get all users that shared for goal
 *
 * @param goal_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.getGoalSharedUsers = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.findOne({ _id: body.goal_id }, function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result && result.shared_users) {
                    result = JSON.parse(JSON.stringify(result));
                    var userids = result.shared_users;

                    var hierarchyObj = {
                        path: 'hierarchy_id'
                    };

                    var userObj = {
                        path: 'user_id'
                    };

                    UserDesignation.find({ user_id: { $in: userids } }).populate(hierarchyObj).populate(userObj).exec(function (error, records) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong"
                            });
                        } else {
                            return response.send({
                                status: true,
                                data: records
                            })
                        }
                    })
                } else {
                    return response.send({
                        status: true,
                        data: []
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
}

/**
 * This function get all goals of plan
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-04
 */
module.exports.getGoalByPlan = function (request, response) {
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
        Goals.find({
            plan_id: body.plan_id,
            $or: [{
                parent_goal_id: { $exists: false }
            }, {
                parent_goal_id: ''
            }],
        }, function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    data: results
                })
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
 * This function store goal attachment
 *
 * @param goal_id, attachments
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-04
 */
module.exports.storeGoalAttachments = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
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

        var goal_id = body.goal_id;
        var getTime = new Date().getTime();

        var is_Array = Array.isArray(attachments);

        if (is_Array == true && attachments.length > 0) {
            var insertAttachmentObject = [];

            attachments.forEach(element => {
                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/goals_attachments/' + file_name, element.data, { mode: 0o755 });

                var data = {
                    attachment: file_name,
                    goal_id: goal_id
                };

                insertAttachmentObject.push(data);
            });

            if (insertAttachmentObject && insertAttachmentObject.length > 0) {
                GoalAttachment.insertMany(insertAttachmentObject, function (error, result) {
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
            fs.writeFileSync('./public/goals_attachments/' + file_name, element.data);

            var data = {
                attachment: file_name,
                goal_id: goal_id
            };

            var goalAttachments = new GoalAttachment(data);
            goalAttachments.save();

            if (goalAttachments) {
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
 * This function store message that send by user on particular goal.
 *
 * @param goal_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-04
 */
module.exports.sendMessage = async function (body) {
    try {
        const goalChat = new GoalChat({
            goal_id: body.goal_id,
            sender_id: body.sender_id,
            message: body.message
        });
        await goalChat.save();

        if (goalChat) {
            if (body.attachments && body.attachments.length > 0) {
                var insertAttachmentObject = [];
                var getTime = new Date().getTime();

                body.attachments.forEach((element, index) => {
                    var name = body.attachment_name[index];

                    //path to store uploaded files
                    var fileName = './public/chat_attachment/' + name;

                    fs.open(fileName, 'a', 0o755, function (err, fd) {
                        if (err) throw err;

                        fs.write(fd, element, null, 'Binary', function (err, written, buff) {
                            fs.close(fd, function () {
                                console.log('File saved successful!');
                            });
                        })
                    });

                    insertAttachmentObject.push(name);
                });

                await GoalChat.updateOne({ _id: goalChat._id }, { attachments: insertAttachmentObject });
            }

            return goalChat;
        }
    } catch (error) {
        return '';
    }
};


/**
 * Get goal chat
 *
 * @param goal_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-04
 */
module.exports.getGoalChat = function (request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
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

        GoalChat.find({ goal_id: body.goal_id }).sort({ "created_at": 1 }).populate(userObj).exec(function (error, results) {
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
 * Get goal single chat
 *
 * @param goal_chat_id (id)
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-03
 */
module.exports.getGoalSingleChat = function (request, response) {
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

        GoalChat.findById(body._id).populate(userObj).exec(function (error, element) {
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
 * Create strategy
 *
 * @param
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.createStrategies = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.short_name) {
        errors.push(["Short name is required"]);
    }

    if (!body.long_name) {
        errors.push(["Long name is required"]);
    }

    if (!body.start_date) {
        errors.push(["Start date is required"]);
    }

    if (!body.end_date) {
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
        if (body.controls && body.controls.length > 0) {
            async1.each(body.controls, function (element, cd2) {
                if (element.type == "text") {
                    Strategies.schema.add({
                        [element.name]: String
                    });
                } else if (element.type == "number") {
                    // Plan.schema[element.name]= Number;
                    Strategies.schema.add({
                        [element.name]: Number
                    });
                } else if (element.type == "select") {
                    Strategies.schema.add({
                        [element.name]: String
                    });
                }
            })
        }

        Strategies.find({ plan_id: body.plan_id }, async (err, res) => {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (res && res.length > 0) {
                    body.prioritize = res[0].prioritize + 1;
                } else {
                    body.prioritize = 1;
                }

                const strategy = new Strategies(body);
                await strategy.save();

                if (strategy) {
                    return response.status(201).send({
                        status: true,
                        message: "Strategy has been created successfully."
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Something went wrong. plan has not been created."
                    });
                }
            }
        }).sort({ prioritize: -1 }).limit(1);
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * get strategies
 *
 * @param
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.getStrategies = function (request, response) {
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
        Strategies.find({ plan_id: body.plan_id }, async (err, records) => {
            if (err) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    data: records
                });
            }
        }).sort({ prioritize: -1 }).limit(1);
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}

/**
 * This function store strategy attachment
 *
 * @param strategy_id, file.attachments
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-04
 */
module.exports.storeStrategyAttachments = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.strategy_id) {
        errors.push(["Strategy id is required"]);
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

        var strategy_id = body.strategy_id;
        var getTime = new Date().getTime();

        var is_Array = Array.isArray(attachments);

        if (is_Array == true && attachments.length > 0) {
            var insertAttachmentObject = [];

            attachments.forEach(element => {
                var file_name = getTime + '-' + element.name;
                fs.writeFileSync('./public/strategy_attachments/' + file_name, element.data, { mode: 0o755 });

                var data = {
                    attachment: file_name,
                    strategy_id: strategy_id
                };

                insertAttachmentObject.push(data);
            });

            if (insertAttachmentObject && insertAttachmentObject.length > 0) {
                StrategyAttachments.insertMany(insertAttachmentObject, function (error, result) {
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
            fs.writeFileSync('./public/strategy_attachments/' + file_name, element.data);

            var data = {
                attachment: file_name,
                strategy_id: strategy_id
            };

            var strategyAttachments = new StrategyAttachments(data);
            strategyAttachments.save();

            if (strategyAttachments) {
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
 * This function get strategy attachments
 *
 * @param strategy_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.getStrategyAttachments = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.strategy_id) {
        errors.push(["Strategy id is required"]);
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

        StrategyAttachments.find({ strategy_id: body.strategy_id }, function (error, attachments) {
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
                            var image = site_url + '/strategy_attachments/' + file_name;
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
 * This function remove attachment from strategy
 *
 * @param goal_attachment_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.deleteStrategyAttachment = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.strategy_attachment_id) {
        errors.push(["Strategy attachment id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        StrategyAttachments.deleteOne({ _id: body.strategy_attachment_id }, function (error, result) {
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
 * @param strategy_id, message, attachment, sender_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.sendStrategyMessage = async function (body) {
    try {
        const strategyChat = new StrategyChats({
            strategy_id: body.strategy_id,
            sender_id: body.sender_id,
            message: body.message
        });
        await strategyChat.save();

        if (strategyChat) {
            if (body.attachments && body.attachments.length > 0) {
                var insertAttachmentObject = [];
                var getTime = new Date().getTime();

                body.attachments.forEach((element, index) => {
                    var name = body.attachment_name[index];

                    //path to store uploaded files
                    var fileName = './public/chat_attachment/' + name;

                    fs.open(fileName, 'a', 0o755, function (err, fd) {
                        if (err) throw err;

                        fs.write(fd, element, null, 'Binary', function (err, written, buff) {
                            fs.close(fd, function () {
                                console.log('File saved successful!');
                            });
                        })
                    });

                    insertAttachmentObject.push(name);
                });

                await StrategyChats.updateOne({ _id: strategyChat._id }, { attachments: insertAttachmentObject });
            }

            return strategyChat;
        }
    } catch (error) {
        return '';
    }
};

/**
 * Get goal single chat
 *
 * @param goal_chat_id (id)
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-03-03
 */
module.exports.getStrategySingleChat = function (request, response) {
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

        StrategyChats.findById(body._id).populate(userObj).exec(function (error, element) {
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
 * Get Strategy chats
 *
 * @param strategy_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.getStrategyfChat = function (request, response) {
    var body = request.body;
    var errors = [];
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.strategy_id) {
        errors.push(["Strategy id is required"]);
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

        StrategyChats.find({ strategy_id: body.strategy_id }).sort({ "created_at": 1 }).populate(userObj).exec(function (error, results) {
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
 * Get Strategy chats
 *
 * @param parent_goal_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-18
 */
module.exports.getChildGoals = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.parent_goal_id) {
        errors.push(["Parent goal id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Goals.find({ parent_goal_id: body.parent_goal_id }, function (error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    data: records
                });
            }
        });
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};