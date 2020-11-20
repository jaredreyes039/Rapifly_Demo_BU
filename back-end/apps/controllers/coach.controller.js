const Coaches = require('../models/coaches.model');
const emailHelper = require('../helpers/email.helper');

/**
 * Register new coach
 *
 * @param first_name, last_name, email, phone, title, industries, company_name (optional)
 * @author  Hardik Gadhiya
 * @version 4.0
 */
exports.register = async function(request, response) {
    var body = request.body;

    var errors = [];

    if (!body.first_name) {
        errors.push(['First name is required']);
    }
    if (!body.last_name) {
        errors.push(['Last name id is required']);
    }
    if (!body.email) {
        errors.push(['Email is required']);
    }
    if (!body.phone) {
        errors.push(['Phone is required']);
    }
    if (!body.title) {
        errors.push(['title id is required']);
    }
    if (!body.industries) {
        errors.push(['Industries is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    // Create a new coach
    try {
        Coaches.find({ email: body.email }, async function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Somthing went wrong."
                })
            } else {
                if (results && results.length > 0) {
                    return response.send({
                        status: false,
                        message: "Email is already exists in our records."
                    });
                } else {
                    const coach = new Coaches(body)
                    await coach.save();

                    if (coach) {
                        var html = `<h1>RapiFly</h1><br>` +
                            `<h4>${body.first_name} ${body.last_name}, Your details has been saved successfully.</h4><br>` +
                            `<p>Admin will contact you soon.</p><br><br>` +
                            `<h6>Thank you</h6><p>RapiFly Team</p>`;

                        await emailHelper.sendEmail(body.email, "Coach Registeration - RapiFly", html);
                        return response.send({
                            status: true,
                            message: "Your details has been saved successfully."
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong with coach registeration."
                        })
                    }
                }
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

/**
 * get all coach
 *
 * @param 
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.list = async function(request, response) {
    var body = request.body;

    try {
        Coaches.find({}, async function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Somthing went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    data: results
                })
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

/**
 * Search coaches
 *
 * @param 
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.filter = async function(request, response) {
    var body = request.body;

    var data = {};

    if (body.email && body.email != '') {
        data.email = body.email;
    }
    if (body.first_name && body.first_name != '') {
        data.first_name = { '$regex': body.first_name, '$options': 'i' };
    }
    if (body.last_name && body.last_name != '') {
        data.last_name = { '$regex': body.last_name, '$options': 'i' };
    }
    if (body.phone && body.phone != '') {
        data.phone = body.phone;
    }
    if (body.company_name && body.company_name != '') {
        data.company_name = { '$regex': body.company_name, '$options': 'i' };
    }
    if (body.title && body.title != '') {
        data.title = { '$regex': body.title, '$options': 'i' };
    }
    if (body.industries && body.industries != '') {
        data.industries = { '$regex': body.industries, '$options': 'i' };
    }

    try {
        Coaches.find(data, async function(error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Somthing went wrong."
                })
            } else {
                return response.send({
                    status: true,
                    data: results
                })
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};