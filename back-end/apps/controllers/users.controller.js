const User = require('../models/user.model');
const ResetPassword = require('../models/reser-password.model');
const Role = require('../models/roles.model');
const InviteUser = require('../models/invite_users.model');
const UsersDesignation = require('../models/users_designation.model')
const Hierarchy = require("../models/hierarchy.model");
const emailHelper = require('../helpers/email.helper');
const Delegation = require("../models/delegation.model");
const fs = require('fs');
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
const moment = require('moment');
const asyncl = require('async');
const commonHelper = require('../helpers/common.helper');

//Simple version, without validation or sanitation
exports.test = function (request, response) {
    return response.send(request.body)
};

/**
 * Register new user with role
 *
 * @param first_name, last_name, email, password, role_id
 * @author  Hardik Gadhiya
 * @version 1.0
 */
exports.user_create = async function (request, response) {
    // Create a new user
    console.log("exports.user_create=function -> request.body", request.body)
    return
    try {
        const user = new User(request.body)
        await user.save()
        await user.generateAuthToken();
        return response.send({ status: true, message: "User has been registered successfully." })
    } catch (err) {
        return response.send({
            status: false,
            message: (err.name === 'MongoError' && err.code === 11000) ? 'Email is already exists in our records!' : "Something went wrong"
        });
    }
};

//Simple version, without validation or sanitation
exports.user_authentication = async function (request, response) {
    //Login a registered user
    try {
        const { email, password } = request.body

        // Search for a user by email and password.
        const user = await User.findOne({ email })
        if (!user) {
            return response.send({ status: false, message: 'Email has not been match with our records.' })
        }

        // Search for a user by email and password.
        const is_user_active = await User.findOne({ email: email, status: 1 })
        if (!is_user_active) {
            return response.send({
                status: false,
                message: 'Your account is deactivated. Please contact your administrator.'
            })
        }

        //Compare password
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return response.send({ status: false, message: 'Password has not been match with our records.' })
        }

        //Generate and update JWT token to user account
        const token = await user.generateAuthToken();
        Role.findById(user.role_id, function (error, role) {
            if (error) {
                return response.send({
                    status: false,
                    message: 'Something went wrong.'
                });
            } else {
                return response.send({ status: true, data: { user, token, role: role.name } })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

exports.user_reset_password = async function (request, response) {
    var body = request.body;

    if (!body.email && !body.clientUrl) {
        return response.send({
            status: false,
            message: "Email id and Client url are required"
        });
    }

    const { email, password } = request.body;
    const user = await User.findOne({ email });

    if (!user) {
        return response.send({
            status: false,
            message: "No user found with this email address."
        });
    } else {
        ResetPassword.findOne({
            where: { userId: user.id }
        }, function (resetPassword) {
            ResetPassword.deleteMany({
                where: {
                    userId: user.id
                }
            }, function (error, result) {

            });

            //creating the token to be sent to the forgot password form.
            var token = crypto.randomBytes(32).toString('hex');

            ResetPassword.create({
                userId: user.id,
                resetPasswordToken: token,
                expire: moment.utc().add(24, 'hours'),
            }).then(function (item) {
                if (!item) {
                    return response.send({ status: false, message: 'Oops problem in creating new password record' })
                }

                var html = '<h4><b>Reset Password</b></h4>' +
                    '<p>To reset your password, complete this form:</p>' +
                    '<a href="' + body.clientUrl + '/reset/password/' + user.id + '/' + token + '">Reset Password</a>' +
                    '<br><br>' +
                    '<p>--Team</p>';

                emailHelper.sendEmail(user.email, "Reset Password Request", html);

                return response.send({
                    status: true,
                    message: "Reset password link has been sent on your email."
                });
            })
        });
    }
}

exports.user_update_reset_password = async function (request, response) {
    var body = request.body;
    var password = body.password;
    var confirm_password = body.confirm_password;
    var token = body.token;
    var user_id = body.user_id;

    var errors = [];

    if (!password) {
        errors.push(['Password is required']);
    }
    if (!confirm_password) {
        errors.push(['Confirm password is required']);
    }
    if (password !== confirm_password) {
        errors.push(['Password and Confirm password does not match.']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }

    var passwordHash = await bcrypt.hash(password, 8);

    ResetPassword.findOne({ resetPasswordToken: token }, function (error, resetPasswordDetails) {
        if (error) {
            return response.send({
                status: false,
                message: "Something went wrong."
            });
        } else {
            if (resetPasswordDetails) {
                var hashToken = resetPasswordDetails.resetPasswordToken;
                var expireAt = resetPasswordDetails.expire;

                if (token === hashToken) {
                    var currentDate = new Date().getTime();
                    var expireDate = new Date(expireAt).getTime();

                    if (currentDate > expireDate) {
                        return response.send({
                            status: false,
                            message: "Token has been expired. Please try again."
                        });
                    } else {
                        var where = { _id: user_id };
                        var query = {
                            $set: {
                                password: passwordHash
                            }
                        };

                        User.updateOne(where, query, function (error, user) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong with password updation. Please try again later."
                                });
                            } else {
                                ResetPassword.deleteMany({
                                    userId: user_id
                                }, function (error, result) {
                                    return response.send({
                                        status: true,
                                        message: "Password has been updated successfully"
                                    })
                                });
                            }
                        });
                    }
                } else {
                    return response.send({
                        status: false,
                        message: "Your token has not been match with our records."
                    });
                }
            } else {
                return response.send({
                    status: false,
                    message: "Can not find user details."
                });
            }
        }
    });
};

//Create User and Sign Up API fuction
exports.invite_user = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.email) {
        errors.push(['Email is required']);
    }
    if (!body.hierarchy_id) {
        errors.push(['Hierarchy id is required']);
    }
    if (!body.parent_user_id) {
        errors.push(['Parent user id is required']);
    }
    if (!body.invited_by_user_id) {
        errors.push(['Invited by user id is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');
        return response.send({
            status: false,
            message: message
        });
    }
    // Create a new user
    try {
        InviteUser.findOne({ email: body.email }, async function (error, inviteUser) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong with user invitation."
                })
            } else {
                if (inviteUser) {
                    let defaultPassword = generateRandomString(20)
                    // var html = '<h4><b>User Invitation</b></h4>' +
                    //     '<p>Click on below link for register:</p>' +
                    //     '<a href="' + body.current_url + '/register/invited/users/' + inviteUser._id + '">Register</a>' +
                    //     '<br><br>' +
                    //     '<p>--Team</p>';
                    let html = `
                    <h4><b>User Invitation</b></h4>
                    <p>Your password is:  <b>${defaultPassword}</b></p>
                    <p>Click on below link for login:</p>
                    <a href="${body.current_url}/sign-in">Log in</a>
                    <br><br>
                    <p>--Team</p>
                    `
                    let userRole = await Role.findOne({ name: 'User' })
                    const user = new User({
                        first_name: '',
                        last_name: '',
                        email: inviteUser.email,
                        role_id: userRole._id,
                        password: defaultPassword,
                        parent_user_id: inviteUser.parent_user_id,
                    });
                    await user.save();
                    await user.generateAuthToken();
                    if (user) {
                        var invite_user_id = inviteUser._id;
                        var user_id = user._id;
                        const usersDesignation = new UsersDesignation({
                            hierarchy_id: inviteUser.hierarchy_id,
                            user_id: user_id,
                            parent_user_id: inviteUser.parent_user_id,
                        });
                        await usersDesignation.save();
                        if (usersDesignation) {
                            InviteUser.updateOne({ _id: invite_user_id }, {
                                user_id: user_id,
                                has_registered: 1
                            }, async function (error, level) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong."
                                    })
                                } else {
                                    // return response.send({ status: true, message: "User has been registered successfully." })
                                    await emailHelper.sendEmail(inviteUser.email, "User Invitation - RapiFly", html);
                                    return response.status(201).send({
                                        status: true,
                                        message: "Invitation has been sent successfully."
                                    })
                                }
                            });
                        } else {
                            return response.send({
                                status: false,
                                message: "Something went wrong to save user details."
                            })
                        }
                    }
                } else {
                    const invite_user = new InviteUser(request.body)
                    await invite_user.save()

                    if (invite_user) {
                        let defaultPassword = generateRandomString(20)
                        // var html = '<h4><b>User Invitation</b></h4>' +
                        //     '<p>Click on below link for register:</p>' +
                        //     '<a href="' + body.current_url + '/register/invited/users/' + inviteUser._id + '">Register</a>' +
                        //     '<br><br>' +
                        //     '<p>--Team</p>';
                        let html = `
                            <h4><b>User Invitation</b></h4>
                            <p>Your password is:  <b>${defaultPassword}</b></p>
                            <p>Click on below link for login:</p>
                            <a href="${body.current_url}/sign-in">Log in</a>
                            <br><br>
                            <p>--Team</p>
                            `
                        let userRole = await Role.findOne({ name: 'User' })
                        const user = new User({
                            first_name: '',
                            last_name: '',
                            email: inviteUser.email,
                            role_id: userRole._id,
                            password: defaultPassword,
                            parent_user_id: inviteUser.parent_user_id,
                        });
                        await user.save();
                        await user.generateAuthToken();
                        if (user) {
                            var invite_user_id = inviteUser._id;
                            var user_id = user._id;
                            const usersDesignation = new UsersDesignation({
                                hierarchy_id: inviteUser.hierarchy_id,
                                user_id: user_id,
                                parent_user_id: inviteUser.parent_user_id,
                            });
                            await usersDesignation.save();
                            if (usersDesignation) {
                                InviteUser.updateOne({ _id: invite_user_id }, {
                                    user_id: user_id,
                                    has_registered: 1
                                }, async function (error, level) {
                                    if (error) {
                                        return response.send({
                                            status: false,
                                            message: "Something went wrong."
                                        })
                                    } else {
                                        // return response.send({ status: true, message: "User has been registered successfully." })
                                        await emailHelper.sendEmail(inviteUser.email, "User Invitation - RapiFly", html);
                                        return response.status(201).send({
                                            status: true,
                                            message: "Invitation has been sent successfully."
                                        })
                                    }
                                });
                            } else {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong to save user details."
                                })
                            }
                        }
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong with user invitation."
                        })
                    }
                }
            }
        })
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong"
        });
    }
};

exports.get_invite_user_details = async function (request, response) {
    var body = request.body;

    if (!body.id) {
        return response.send({
            status: false,
            message: "Id is required"
        });
    }

    try {
        InviteUser.findById(body.id, function (error, userPlan) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong. Role has not been created."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: userPlan
                })
            }
        });
    } catch (error) {
        return response.status(400).send({
            status: false,
            message: "Something went wrong"
        })
    }
};

//Create User and Sign Up API fuction
exports.save = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.first_name) {
        errors.push(['First name id is required']);
    }
    if (!body.last_name) {
        errors.push(['Last name is required']);
    }
    if (!body.email) {
        errors.push(['Email is required']);
    }
    if (!body.password) {
        errors.push(['Password is required']);
    }
    if (!body.parent_user_id) {
        errors.push(['Parent user id is required']);
    }
    if (!body.invite_user_id) {
        errors.push(['Invite user id is required']);
    }
    if (!body.role_id) {
        errors.push(['Role id is required']);
    }
    if (!body.hierarchy_id) {
        errors.push(['Hierarchy id is required']);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(' , ');

        return response.send({
            status: false,
            message: message
        });
    }

    // Create a new user
    try {
        const user = new User({
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            role_id: body.role_id,
            password: body.password,
            parent_user_id: body.parent_user_id,
        });

        await user.save();
        await user.generateAuthToken();

        if (user) {
            var invite_user_id = body.invite_user_id;
            var user_id = user._id;

            const usersDesignation = new UsersDesignation({
                hierarchy_id: body.hierarchy_id,
                user_id: user_id,
                parent_user_id: body.parent_user_id,
            });

            await usersDesignation.save();

            if (usersDesignation) {
                InviteUser.updateOne({ _id: invite_user_id }, {
                    user_id: user_id,
                    has_registered: 1
                }, function (error, level) {
                    if (error) {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        })
                    } else {
                        return response.send({ status: true, message: "User has been registered successfully." })
                    }
                });
            } else {
                return response.send({
                    status: false,
                    message: "Something went wrong to save user details."
                })
            }
        } else {
            return response.send({
                status: false,
                message: "Something went wrong. User has not been created."
            })
        }
    } catch (err) {
        return response.send({
            status: false,
            message: (err.name === 'MongoError' && err.code === 11000) ? 'Email is already exists in our records!' : 'Something went wrong.'
        });
    }
};

exports.get_by_organization = function (request, response) {
    var body = request.body;

    if (!body.organization_id) {
        return response.send({
            status: false,
            message: "Level id is required"
        });
    }

    try {
        User.find({
            organization_id: body.organization_id
        }, function (error, roles) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    data: roles
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

exports.check_new_user = function (request, response) {
    var body = request.body;
    console.log("body", body)

    if (!body.email) {
        return response.send({
            status: false,
            message: "email is required"
        });
    }

    try {
        InviteUser.find({
            email: body.email
        }, function (error, records) {
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
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

exports.get_all_user_by_id = function (request, response) {
    var body = request.body;

    if (!body.email) {
        return response.send({
            status: false,
            message: "email is required"
        });
    }

    try {
        InviteUser.find({
            email: body.email
        }, function (error, records) {
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
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

module.exports.get_user_by_parent = function (request, response) {
    var body = request.body;

    if (!body.parent_user_id) {
        return response.send({
            status: false,
            message: "Parent user id is required."
        });
    }

    try {
        User.find({ parent_user_id: body.parent_user_id }, {}, { sort: { created_at: 1 } }, function (error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (records && records.length > 0) {
                    var usersArray = [];

                    asyncl.each(records, function (element, callback) {
                        var designation = {};
                        var user = element;

                        var hierarchyObj = {
                            path: 'hierarchy_id',
                        };

                        //Get User Avatar
                        var site_url = request.protocol + '://' + request.get('host');

                        var image;
                        var avatar_url = '';


                        if (element.avatar) {
                            var file_name = element.avatar;
                            image = site_url + '/avatars/' + file_name;
                            avatar_url = image;
                        }

                        UsersDesignation.findOne({ user_id: element._id }).populate(hierarchyObj).exec(function (error, result) {
                            if (!error && result) {
                                designation = result.hierarchy_id;
                            }
                            var data = { user, designation, avatar_url };
                            usersArray.push(data);
                            callback();
                        });
                    }, function (error) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            return response.send({
                                status: true,
                                data: usersArray
                            })
                        }
                    })
                } else {
                    return response.send({
                        status: false,
                        message: "Users details has not been found."
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

exports.update_status = async function (request, response) {
    var body = request.body;

    if (!body.id && !body.status) {
        return response.send({
            status: false,
            message: "id and status are required."
        });
    }

    try {
        User.updateOne({ _id: body.id }, {
            status: body.status
        }, function (error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                return response.status(201).send({
                    status: true,
                    message: "User status hase been change Successfully"
                })
            }
        });
    } catch (error) {
        return response.status(400).send({
            status: false,
            message: "Something went wrong."
        })
    }
};

//Get Users by invited user
module.exports.get_invited_users = function (request, response) {
    var body = request.body;

    if (!body.user_id) {
        return response.send({
            status: false,
            message: "User id is required."
        });
    }

    try {
        InviteUser.find({ invited_by_user_id: body.user_id, has_registered: 1 }, { user_id: 1 }, function (error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (records && records.length > 0) {
                    var user_ids = records.map(data => data.user_id);

                    User.find({ _id: { $in: user_ids } }, {}, { sort: { created_at: 1 } }, function (error, records) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            })
                        } else {
                            if (records && records.length > 0) {
                                var usersArray = [];

                                asyncl.each(records, function (element, callback) {
                                    var designation = {};
                                    var user = element;

                                    var hierarchyObj = {
                                        path: 'hierarchy_id',
                                    };

                                    UsersDesignation.findOne({ user_id: element._id }).populate(hierarchyObj).exec(function (error, result) {
                                        if (!error && result) {
                                            designation = result.hierarchy_id;
                                        }
                                        var data = { user, designation };
                                        usersArray.push(data);
                                        callback();
                                    });
                                }, function (error) {
                                    if (error) {
                                        return response.send({
                                            status: false,
                                            message: "Something went wrong."
                                        });
                                    } else {
                                        return response.send({
                                            status: true,
                                            data: usersArray
                                        })
                                    }
                                })
                            } else {
                                return response.send({
                                    status: false,
                                    message: "Users details has not been found."
                                })
                            }
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "You have not invited any users."
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
 * This function get user profile details.
 *
 * @param plan_id, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-18
 */
module.exports.getUserProfile = function (request, response) {
    var body = request.body;
    var site_url = request.protocol + '://' + request.get('host');

    if (!body.user_id) {
        return response.send({
            status: false,
            message: "User id is required."
        });
    }

    try {
        User.findById(body.user_id, async function (error, user) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                var image;
                var avatar_url = '';

                if (user.avatar) {
                    var file_name = user.avatar;
                    image = site_url + '/avatars/' + file_name;
                    avatar_url = image;
                }

                var hierarchyObj = {
                    path: 'hierarchy_id'
                };

                var getDesignation = await UsersDesignation.findOne({ user_id: body.user_id }).populate(hierarchyObj);
                var designation = '';

                if (getDesignation) {
                    designation = getDesignation.hierarchy_id.designation;
                }

                return response.send({
                    status: true,
                    data: user,
                    avatar_url,
                    designation
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

/**
 * This function update user profile details.
 *
 * @param plan_id, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-18
 */
module.exports.updateProfile = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.id) {
        errors.push(["User id is required"]);
    }
    if (!body.first_name) {
        errors.push(["First name is required"]);
    }
    if (!body.last_name) {
        errors.push(["Last name is required"]);
    }
    if (!body.email) {
        errors.push(["Email is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        User.find({
            _id: {
                $ne: body.id
            },
            email: body.email
        }, function (error, user) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                })
            } else {
                if (user && user.length > 0) {
                    return response.send({
                        status: false,
                        message: "Email address is already exists in our records."
                    })
                } else {
                    User.updateOne({ _id: body.id }, {
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                    }, function (error, result) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            })
                        } else {
                            return response.send({
                                status: true,
                                message: "Profile has been updated successfully"
                            })
                        }
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
 * This function update user profile details.
 *
 * @param plan_id, user_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-18
 */
exports.updateUserPassword = async function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }
    if (!body.password) {
        errors.push(["Password is required"]);
    }
    if (!body.new_password) {
        errors.push(["New password is required"]);
    }
    // if (!body.confirm_password) {
    //     errors.push(["Confirm password is required"]);
    // }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    // if (body.new_password != body.confirm_password) {
    //     return response.send({
    //         status: false,
    //         message: "Confirm password should be same as new password"
    //     });
    // }

    try {
        const { password, new_password, user_id } = request.body
        // Search for a user by email and password.
        const user = await User.findById(user_id)
        if (!user) {
            return response.send({ status: false, message: 'User has not been found.' })
        }
        //Compare current password
        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return response.send({ status: false, message: 'Current password has not been match with our records.' })
        }

        //Update password
        var passwordHash = await bcrypt.hash(new_password, 8);

        var where = { _id: user._id };
        var query = {
            $set: {
                password: passwordHash,
                passwordChanged: true
            }
        };

        User.updateOne(where, query, function (error, user) {
            if (error) {
                return response.send({ status: false, message: "Something went wrong with password updation." });
            } else {
                return response.send({
                    status: true,
                    message: "Password has been updated successfully."
                })
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: "Something went wrong" })
    }
};

module.exports.updateUserAvatar = function (request, response) {
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
        if (request.files && request.files.avatar) {
            var file = request.files.avatar;

            //Save images in public/avatars folder
            var extenstion = file.name.split('.').pop();

            var allowExtensions = ['jpg', 'png', 'jpeg'];

            if (allowExtensions.includes(extenstion) == false) {
                return response.send({
                    status: false,
                    message: "File format has not been supported. only allow " + allowExtensions.join(',') + " formats."
                })
            }

            var timestamp = new Date().getTime();
            var fileName = body.user_id + '-' + timestamp + '.' + extenstion;
            fs.writeFileSync('./public/avatars/' + fileName, file.data);

            User.updateOne({
                _id: body.user_id
            }, {
                avatar: fileName
            }, function (error, user) {
                if (error) {
                    return response.send({ status: false, message: "Something went wrong with password updation." });
                } else {
                    return response.send({
                        status: true,
                        message: "User avatar has been updated successfully."
                    })
                }
            });
        } else {
            return response.send({
                status: false,
                message: "Please upload user avatar."
            })
        }
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong"
        })
    }

}


module.exports.updateAdmindelegationtimeout = function (request, response) {
    var body = request.body;

    if (!body.delegationtimeout) {
        return response.send({
            status: false,
            message: "Please Enter All required Fields"
        });
    }

    try {
        User.updateOne({ _id: body.user_id }, body, function (error, level) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.status(201).send({
                    status: true,
                    message: "Settings has been updated."
                });
            }
        });
    } catch (error) {
        return response.status(400).send({ status: false, message: error });
    }
}

module.exports.getUsersAndDesignations = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_ids) {
        errors.push(["User ids are required"]);
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

        var designationObj = {
            path: 'hierarchy_id'
        };

        UsersDesignation.find({ user_id: { $in: body.user_ids } }).populate(userObj).populate(designationObj).exec(function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                })
            } else {
                return response.send({
                    status: true,
                    data: results
                });
            }
        });
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}
module.exports.getOrganizationUsers = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
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
        var userObj = {
            path: 'user_id'
        };

        var designationObj = {
            path: 'hierarchy_id'
        };

        UsersDesignation.find({
            parent_user_id: body.parent_user_id,
            user_id: { $ne: body.user_id }
        }).populate(userObj).populate(designationObj).exec(function (error, results) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong"
                })
            } else {
                return response.send({
                    status: true,
                    data: results
                });
            }
        });
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

exports.inviteAndCreateUserAndDesignation = function (request, response) {
    var body = request.body;
    var errors = [];

    if (!body.first_name) {
        errors.push(["First name is required"]);
    }

    if (!body.last_name) {
        errors.push(["Last name is required"]);
    }

    if (!body.email) {
        errors.push(["Email is required"]);
    }

    if (!body.designation) {
        errors.push(["Designation is required"]);
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
        // Check email is exixts or not.
        User.find({ email: body.email }, async function (error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result && result.length > 0) {
                    return response.send({
                        status: false,
                        message: "Email is already exists in our records."
                    });
                } else {
                    var password = commonHelper.stringGenerator('12');

                    var data = {
                        first_name: body.first_name,
                        last_name: body.last_name,
                        email: body.email,
                        password: password,
                        parent_user_id: body.parent_user_id,
                        role_id: body.role_id
                    };

                    var user = new User(data);
                    await user.save();

                    if (user) {
                        var userId = user._id;

                        var hierarchyObj = {
                            path: 'hierarchy_id'
                        };

                        UsersDesignation.findOne({ user_id: body.user_id }).populate(hierarchyObj).exec(async function (error, result) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                if (result) {
                                    var hierarchyData = {
                                        user_id: result.hierarchy_id.user_id,
                                        parent_hierarchy_id: result.hierarchy_id.parent_hierarchy_id,
                                        designation: body.designation,
                                        parent_user_id: body.parent_user_id,
                                    };

                                    // Create Hierarchy
                                    var hierarchy = new Hierarchy(hierarchyData);
                                    await hierarchy.save();

                                    if (hierarchy) {
                                        var hierarchyId = hierarchy._id;

                                        var designationData = {
                                            hierarchy_id: hierarchyId,
                                            user_id: userId,
                                            parent_user_id: body.parent_user_id
                                        };

                                        var userDesignation = new UsersDesignation(designationData);
                                        await userDesignation.save();

                                        if (userDesignation) {
                                            var html = '<h4><b>User Invitation</b></h4>' +
                                                '<p>Please check your login details</p>' +
                                                '<p>Login Details:</p>' +
                                                '<p>Email:  ' + body.email + '</p>' +
                                                '<p>Password:  ' + password + '</p>' +
                                                '<a href="' + body.current_url + '/sign-in">Sign In</a>' +
                                                '<br><br>' +
                                                '<p>--Team</p>';

                                            await emailHelper.sendEmail(body.email, "User Invitation - RapiFly", html);
                                            return response.status(201).send({
                                                status: true,
                                                message: "Invitation has been sent successfully."
                                            })
                                        } else {
                                            return response.send({
                                                status: false,
                                                message: "Something went wrong with role creation."
                                            });
                                        }
                                    } else {
                                        return response.send({
                                            status: false,
                                            message: "Something went wrong with hieararchy creation."
                                        });
                                    }
                                } else {
                                    return response.send({
                                        status: false,
                                        message: "User designation details has not been found."
                                    });
                                }
                            }
                        });
                    }
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

function generateRandomString(length) {
    var ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var ID_LENGTH = length;
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
        rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
}