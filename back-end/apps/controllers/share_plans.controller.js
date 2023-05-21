const SharePlan = require('../models/share_plans.model');

/**
 * Share plan with user group or users
 *
 * @param plan_id, user_group_id, user_id, shared_user_ids
 * @author  Hardik Gadhiya
 * @version 1.0
 * @created 26/02/2020
 */
exports.share = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.plan_id) {
        errors.push(['Plan id is required']);
    }

    if (!body.user_group_id || !body.shared_user_ids) {
        errors.push(['User group id is required or Shared user ids is required']);
    }

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
        // var shared_user_ids = body.shared_user_ids;
        var shared_user_ids = ["5e4229de420ffb0420ee6b64", "5e422a28420ffb0420ee6b69", "5e422975420ffb0420ee6b5f"];

        const share_plan = new SharePlan({
            user_id: body.user_id,
            plan_id: body.plan_id,
            user_group_id: body.user_group_id
        });
        share_plan.shared_user_ids = body.shared_user_ids;
        await share_plan.save();

        if (share_plan) {
            return response.send({status: true, message: "Plan has been shared successfully."})
        } else {
            return response.send({status: false, message: "Can not share plan with users or group."})
        }

    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};
