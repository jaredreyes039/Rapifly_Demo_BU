const moment = require('moment');
const asyncLoop = require('async');
const Goals = require('../models/goals.model');
const Delegation = require('../models/delegation.model');
const GoalAlert = require('../models/goal_alert.model');
const User = require('../models/user.model');
/**
 * This function is set as clone, this function check if any goal has delegated 100% then it'll set as a countdown.
 *
 * @param ---
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-12
 */
module.exports.countdownGoal = function() {
    try {
        var planObj = {
            path: 'plan_id'
        };

        Goals.find({}).populate(planObj).exec(async function(error, goals) {
            if (!error && goals && goals.length > 0) {
                for await (const element of goals) {
                    if (element.plan_id.security == 1) {
                        var delegation = await Delegation.find({ goal_id: element._id, is_accept: 1 });

                        if (delegation && delegation.length > 0) {
                            //Get total percentage of delegated goals
                            var totalGoalPercentage = await delegation.reduce(function(sum, item) {
                                return sum = sum + parseFloat(item.percentage);
                            }, 0);

                            if (totalGoalPercentage == 100) {

                                var currentTimestamp = new Date().getTime();
                                if (element.is_countdown_update == 0) {
                                    await Goals.updateOne({ _id: element._id }, { countdown: currentTimestamp, is_countdown_update: 1 });
                                }
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.log(error)
    }
};

module.exports.setAlertForLaunch = function() {
    Goals.find({ is_countdown_update: 1 }).exec(async function(error, goals) {
        if (!error && goals && goals.length > 0) {
            asyncLoop.each(goals, function(element, callback) {

                // console.log(element);
                
                var currentDate = moment().format('YYYY-MM-DD');
                var startDate = new Date(element.start_date);
                startDate.setDate(startDate.getDate() - 1);
                var matchDate = moment(startDate).format('YYYY-MM-DD');

                if (currentDate == matchDate) {
                    Delegation.find({ goal_id: element._id }, function(error, delegations) {
                        if (!error && delegations.length > 0) {
                            delegations.forEach((result) => {
                                // console.log(result);
                                
                                GoalAlert.findOne({
                                    user_id: result.child_user_id,
                                    goal_id: result.goal_id,
                                    plan_id: result.plan_id,
                                    type: "Launch"
                                }, function(error, record) {
                                    if (!error && !record) {
                                        const goalAlert = new GoalAlert({
                                            user_id: result.child_user_id,
                                            goal_id: result.goal_id,
                                            plan_id: result.plan_id,
                                            message: "Goal launch date is tomorrow.",
                                            date: matchDate,
                                            type: "Launch"
                                        });

                                        goalAlert.save();
                                    }
                                });
                            });
                        }
                    });
                }

                callback();
            })
        }
    });
};

module.exports.setAlertForReport = function() {
    Goals.find({ is_countdown_update: 1 }).exec(async function(error, goals) {
        if (!error && goals && goals.length > 0) {
            asyncLoop.each(goals, function(element, callback) {
                var currentDate = moment().format('YYYY-MM-DD');
                var endDate = new Date(element.end_date);
                endDate.setDate(endDate.getDate() - 1);
                var matchDate = moment(endDate).format('YYYY-MM-DD');

                if (currentDate == matchDate) {
                    Delegation.find({ goal_id: element._id }, function(error, delegations) {
                        if (!error && delegations.length > 0) {
                            delegations.forEach((result) => {
                                GoalAlert.findOne({
                                    user_id: result.user_id,
                                    goal_id: result.goal_id,
                                    plan_id: result.plan_id,
                                    type: "Report"
                                }, function(error, record) {
                                    if (!error && !record) {
                                        const goalAlert = new GoalAlert({
                                            user_id: result.user_id,
                                            goal_id: result.goal_id,
                                            plan_id: result.plan_id,
                                            message: "Goal launch date is tomorrow.",
                                            date: matchDate,
                                            type: "Report"
                                        });

                                        goalAlert.save();
                                    }
                                });
                            });
                        }
                    });
                }
                callback();
            })
        }
    });
};


/**
 * This function is set as clone, this function check if any delegation extends timeout then reject that delegation..
 *
 * @param ---
 * @author  Jaydeep Lathiya
 * @version 1.0
 * @since   2020-02-22
 */
module.exports.checkdelegationtimeout = function(request, response) {
   
    User.find({
        parent_user_id:''
    },{_id:1,delegationtimeout:1}, function(error, admin) {
        if (error) {
            console.log(error);
        } else {
            admin.forEach((result) => {
                User.find({
                    parent_user_id: result._id,
                },{_id:1}, function(error, record) {
                    if (!error) {
                       var user_ids = record.map(record => record._id)
                       Delegation.find({is_accept:0 ,user_id: { $in: user_ids }},{created_at:1,_id:1}, function(error, record2) {
                            if (!error) {
                                record2.forEach((result2) => {
                                   // console.log(result2);
                                    var today = moment();
                                    var diff = today - result2.created_at;
                                    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
                                    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
                                    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
                                    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
                                        if(hours>=result.delegationtimeout){
                                            try {
                                                Delegation.updateOne(
                                                  { _id: result2._id },
                                                  { is_accept: 2 },
                                                  function(error, detail) {
                                                    if (error) {
                                                      console.log(error);
                                                    } else {
                                                        console.log("done");
                                                    }
                                                  }
                                                );
                                              } catch (error) {
                                                console.log(error);
                                              }
                                        }
                                })    
                            }
                       })
                    }
                });
            });
        }
    })

}