const moment = require("moment");

const Delegation = require("../models/delegation.model");
const User = require("../models/user.model");
const GoalAlert = require("../models/goal_alert.model");

const EmailHelper = require("../helpers/email.helper");

/**
 * create delegation.
 *
 * @param goal_id, child_user_id, percentage, user_id, description, start_date, end_date
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-11
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
  if (!body.child_user_id) {
    errors.push(["Child user id is required"]);
  }
  if (!body.percentage) {
    errors.push(["Percentage is required"]);
  }
  if (!body.user_id) {
    errors.push(["User id is required"]);
  }
  if (!body.description) {
    errors.push(["Description is required"]);
  }
  if (!body.start_date) {
    errors.push(["Start date is required"]);
  }
  if (!body.end_date) {
    errors.push(["End date is required"]);
  }

  if (errors && errors.length > 0) {
    var message = errors.join(", ");
    return response.send({
      status: false,
      message: message
    });
  }

  try {
    // get child and supririor users details.
    const childUser = await User.findById(body.child_user_id);
    const supiriorUser = await User.findById(body.user_id);
    const parent_id = await User.findById(body.parent_user_id);


    if (childUser && supiriorUser) {
      const delegation = new Delegation(request.body);
      await delegation.save();

      if (delegation) {
        var child_user_html =
          "<h4><b>Hello, " +
          childUser.first_name +
          " " +
          childUser.last_name +
          "</b></h4><br>" +
          "<h5>" +
          supiriorUser.first_name +
          " " +
          supiriorUser.last_name +
          " has delegated you a goal.</h5>" +
          "<h6>Please accept goal delegation request with "+ parent_id.delegationtimeout+" Hours.</h6>" +
          "<br>" +
          "<p>Thanks,</p>" +
          "<p>Rapifly Team</p>";

        //Send email to child user
        await EmailHelper.sendEmail(
          childUser.email,
          "Goal Delegate Request",
          child_user_html
        );

        var parent_user_html =
          "<h4><b>Hello, " +
          supiriorUser.first_name +
          " " +
          supiriorUser.last_name +
          "</b></h4>" +
          "<h5>You have delegated a goal to " +
          childUser.first_name +
          " " +
          childUser.last_name +
          ".</h5>" +
          "<br>" +
          "<p>Thanks,</p>" +
          "<p>Mission Control Team</p>";

        //Send email to supirior user
        await EmailHelper.sendEmail(
          supiriorUser.email,
          "Goal Delegate Request",
          parent_user_html
        );

        return response.send({
          status: true,
          message: "Goal has been delegated to user successfully."
        });
      } else {
        return response.send({
          status: false,
          message: "Something went wrong with delegate goal to user."
        });
      }
    } else {
      return response.send({
        status: false,
        message: "User details has not been found."
      });
    }
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong."
    });
  }
};

/**
 * Update delegation accept status
 *
 * @param delegation_id, accept_status
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-11
 */
module.exports.updateAcceptStatus = function(request, response) {
  var body = request.body;
  var errors = [];

  if (!body.delegation_id) {
    errors.push(["Delegation id is required"]);
  }
  if (!body.accept_status) {
    errors.push(["Accept status is required"]);
  }

  if (errors && errors.length > 0) {
    var message = errors.join(", ");
    return response.send({
      status: false,
      message: message
    });
  }

  try {
    Delegation.updateOne(
      { _id: body.delegation_id },
      { is_accept: body.accept_status },
      function(error, detail) {
        if (error) {
          return response.send({
            status: false,
            message: "Something went wrong."
          });
        } else {
          return response.send({
            status: true,
            message: "Delegate accept status has been updated successfully."
          });
        }
      }
    );
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong."
    });
  }
};

/**
 * Get all delegated goals using goal_id
 *
 * @param goal_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-11 06:15 IST
 */
module.exports.getGoals = function(request, response) {
  var body = request.body;
  var errors = [];

  if (!body.goal_id) {
    errors.push(["Goal id is required"]);
  }

  if (errors && errors.length > 0) {
    var message = errors.join(",");
    return response.send({
      status: false,
      message: message
    });
  }

  try {
    var goalObj = {
      path: "goal_id"
    };
    var userObj = {
      path: "user_id"
    };
    var childuserObj = {
      path: "child_user_id"
    };
    Delegation.find({ goal_id: body.goal_id })
      .populate(goalObj)
      .populate(userObj)
      .populate(childuserObj)
      .exec(function(error, goals) {
        if (error) {
          return response.send({
            status: false,
            message: "Something went wrong."
          });
        } else {
          return response.send({
            status: true,
            data: goals
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
 * Get all delegated goals using child_user_id
 *
 * @param goal_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-11 06:15 IST
 */
module.exports.getUserGoals = function(request, response) {
  var body = request.body;
  var errors = [];
  // console.log("dfguser");

  if (!body.child_user_id) {
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
    var goalObj = {
      path: "goal_id"
    };

    var planObj = {
      path: "plan_id"
    };
    var userObj = {
      path: "user_id"
    };

    Delegation.find({ child_user_id: body.child_user_id, is_accept: 0 })
      .populate(goalObj)
      .populate(planObj)
      .populate(userObj)
      .exec(function(error, goals) {
        if (error) {
          return response.send({
            status: false,
            message: "Something went wrong."
          });
        } else {
          //  console.log(goals);
          return response.send({
            status: true,
            data: goals
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
 * Get all alerts of launch
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-14 06:15 IST
 */
module.exports.getGoalAlertsForLaunch = function(request, response) {
  var body = request.body;
  var errors = [];

  if (!body.user_id) {
    errors.push(["User id is required"]);
  }

  if (errors && errors.length > 0) {
    var message = errors.join(", ");
    return response.send({
      status: false,
      message: message
    });
  }

  try {
    var currentDate = moment().format("YYYY-MM-DD");

    var goalObj = {
      path: "goal_id"
    };

    GoalAlert.find({
      user_id: body.user_id,
      date: { $eq: currentDate + "T00:00:00.000Z" },
    })
      .populate(goalObj)
      .exec(function(error, results) {
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
 * Get all alerts of report
 *
 * @param user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-14 06:15 IST
 */
module.exports.getGoalAlertsForReport = function(request, response) {
  var body = request.body;
  var errors = [];

  if (!body.user_id) {
    errors.push(["User id is required"]);
  }

  if (errors && errors.length > 0) {
    var message = errors.join(", ");
    return response.send({
      status: false,
      message: message
    });
  }

  try {
    var currentDate = moment().format("YYYY-MM-DD");

    GoalAlert.find(
      {
        user_id: body.user_id,
        date: { $eq: currentDate + "T00:00:00.000Z" },
        type: "Report"
      },
      function(error, results) {
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
      }
    );
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong."
    });
  }
};
