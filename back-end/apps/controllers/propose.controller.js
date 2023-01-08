const Propose = require("../models/propose.model");
const ProposeHistory = require("../models/propose_history.model");
const UserDesignation = require("../models/users_designation.model");
const Goal = require("../models/goals.model");
const asyncLoop = require("async");
const User = require("../models/user.model");
/**
 * If user want to propose any plan to its superior. This function will create and update records in propose table.
 * And store logs while superior and user change on propose plan to superior.
 *
 * @param plan_id, goal_id, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-12
 */
module.exports.manage = async function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }
    if (!body.goal_id) {
        errors.push(["Goal id is required"]);
    }
    if (!body.user_id) {
        errors.push(["Child user id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(", ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var hierarchyObj = {
            path: "hierarchy_id"
        };

        UserDesignation.findOne({ user_id: body.user_id })
            .populate(hierarchyObj)
            .exec(function(error, result) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong"
                    });
                } else {
                    if (result) {
                        Propose.findOne({
                                goal_id: body.goal_id,
                                plan_id: body.plan_id
                            },
                            async function(error, detail) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong"
                                    });
                                } else {
                                    var superior_id = "";

                                    var data = {
                                        goal_id: body.goal_id,
                                        plan_id: body.plan_id,
                                        user_id: body.user_id
                                    };

                                    if (result.hierarchy_id.parent_hierarchy_id) {
                                        var superiorDetails = await UserDesignation.findOne({
                                            hierarchy_id: result.hierarchy_id.parent_hierarchy_id
                                        });

                                        if (superiorDetails) {
                                            superior_id = superiorDetails.user_id;
                                        }
                                    } else {
                                        data.status = 0;
                                        await Goal.updateOne({ _id: body.goal_id }, { propose: 1 });
                                    }

                                    if (detail) {
                                        console.log("sdffsdf");
                                        var propose_id = detail._id;
                                        console.log(data);
                                        data.superior_id = superior_id;


                                        Propose.updateOne({ _id: propose_id }, data, async function(
                                            error,
                                            propose
                                        ) {
                                            if (error) {
                                                console.log(error);

                                                return response.send({
                                                    status: false,
                                                    message: "Something went wrong with update propose details."
                                                });
                                            } else {
                                                var proposeHistoryData = {
                                                    propose_id: propose_id,
                                                    goal_id: body.goal_id,
                                                    plan_id: body.plan_id,
                                                    user_id: body.user_id,
                                                    superior_id: superior_id
                                                };

                                                await saveProposeHistory(proposeHistoryData);

                                                return response.send({
                                                    status: true,
                                                    message: "Plan item has been proposed to your superior."
                                                });
                                            }
                                        });
                                    } else {
                                        data.superior_id = superior_id;

                                        const propose = new Propose(data);
                                        propose.save();

                                        if (propose) {
                                            var proposeHistoryData = {
                                                propose_id: propose._id,
                                                goal_id: body.goal_id,
                                                plan_id: body.plan_id,
                                                user_id: body.user_id,
                                                superior_id: superior_id
                                            };

                                            await saveProposeHistory(proposeHistoryData);

                                            return response.send({
                                                status: true,
                                                message: "Plan item has been proposed to your superior."
                                            });
                                        }
                                    }
                                }
                            }
                        );
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong"
                        });
                    }
                }
            });
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }

    async function saveProposeHistory(data) {
        const propose_history = new ProposeHistory(data);
        await propose_history.save();
    }
};

/**
 * This function return all goals and proposal goals of user and plan.
 *
 * @param plan_id, user_id
 * @author  Hardik Gadhiya && Jaydeep Lathiya
 * @version 1.0
 * @since   2020-02-12
 */
exports.getSuperiorProposeGoals = async function(request, response) {
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

    try {
        var goalObj = {
            path: "goal_id"
        };

        var superiorObj = {
            path: "superior_id"
        };

        // Propose.find({ superior_id: body.user_id, plan_id: body.plan_id })
        //   .populate(goalObj)
        //   .exec(function(error, records) {
        //     if (error) {
        //       return response.status(400).send({
        //         status: false,
        //         message: error
        //       });
        //     } else {
        //       if (records && records.length > 0) {
        //         var goalArr = [];

        //         asyncLoop.each(records,function(data, callback) {
        //             User.findById(data.goal_id.user_id, function(error, user) {
        //               if (!error && user) {
        //                 var goalData = {
        //                     data
        //                 };

        //                 goalData.data.goal_id.user_id = user;
        //                 goalArr.push(goalData);
        //                 callback();
        //               }else{
        //                 callback();
        //               }
        //             });

        //           },
        //           function() {
        //               console.log(goalArr)
        //             return response.send({
        //               status: true,
        //               data: goalArr
        //             });
        //           }
        //         );
        //       }else{
        //         return response.send({
        //             status: true,
        //             data: []
        //           });
        //       }
        //     }
        //   });

        Propose.find({ superior_id: body.user_id, plan_id: body.plan_id }).exec(function(error, records) {
            if (error) {
                return response.status(400).send({
                    status: false,
                    message: error
                });
            } else {
                asyncLoop.each(records, function(data, callback2) {
                    Goal.findOne({ _id: data.goal_id, propose: 0, deactivate: 0 }, function(error, goal) {
                        if (!error && goal) {
                            data.goal_id = goal;
                            callback2();
                        } else {
                            callback2();
                        }
                    });
                }, function() {
                    if (records && records.length > 0) {
                        var goalArr = [];

                        asyncLoop.each(records, function(data, callback) {
                                User.findById(data.goal_id.user_id, function(error, user) {
                                    if (!error && user) {
                                        var goalData = {
                                            data
                                        };

                                        goalData.data.goal_id.user_id = user;
                                        goalArr.push(goalData);
                                        callback();
                                    } else {
                                        callback();
                                    }
                                });

                            },
                            function() {
                                // console.log(goalArr)
                                return response.send({
                                    status: true,
                                    data: goalArr
                                });
                            }
                        );
                    } else {
                        return response.send({
                            status: true,
                            data: []
                        });
                    }
                });

            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
};

/**
 * This function return all goals and check if goals in proposal history then it skip.
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-13
 */
exports.getGoalByPlan = async function(request, response) {
    var body = request.body;

    var errors = [];

    if (!body.plan_id) {
        errors.push(["Plan id is required"]);
    }
    if (!body.user_id) {
        errors.push(["User id is required"]);
    }
    if (!body.module_type) {
        errors.push(["Module type is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(", ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        var obj = {
            path: "user_id"
        };

        Goal.find({ plan_id: body.plan_id, module_type: body.module_type, propose: 0, deactivate: 0 }).populate(obj).sort({ prioritize: 1 }).exec(async function(error, goals) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                var proposalGoals = [];

                if (goals && goals.length > 0) {
                    //Get goal id array from goals details

                    asyncLoop.each(
                        goals,
                        function(data, callback) {
                            var goal_id = data._id;
                            ProposeHistory.find({
                                    goal_id: goal_id,
                                    user_id: body.user_id
                                },
                                function(error, results) {
                                    if (!error && results && results.length == 0) {
                                        proposalGoals.push(data);
                                    }
                                    callback();
                                }
                            );
                        },
                        function() {
                            if (proposalGoals && proposalGoals.length > 0) {
                                return response.send({
                                    status: true,
                                    data: proposalGoals
                                });
                            } else {
                                return response.send({
                                    status: true,
                                    data: []
                                });
                            }
                        }
                    );
                } else {
                    return response.send({
                        status: true,
                        data: []
                    });
                }
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" });
    }
};