const Hierarchy = require("../models/hierarchy.model");
const UsersDesignation = require("../models/users_designation.model");
const asyncLoop = require("async");

exports.get_by_designation = function(request, response) {
    var body = request.body;

    if (!body.parent_user_id) {
        return response.send({
            status: false,
            message: "Parent user id is required"
        });
    }

    try {
        Hierarchy.find({ parent_user_id: body.parent_user_id }).exec(function(
            error,
            records
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.status(201).send({
                    status: true,
                    data: records
                });
            }
        });
    } catch (error) {
        return response
            .status(400)
            .send({ status: false, message: "Something went wrong" });
    }
};

//Create and save hierarchy
exports.save = async function(request, response) {
    var body = request.body;

    var errors = [];

    if (!body.designation) {
        errors.push(["Designation is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.find({
                parent_user_id: body.parent_user_id,
                designation: body.designation
            },
            async function(error, records) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    if (records && records.length > 0) {
                        return response.send({
                            status: false,
                            message: "Designation is already exists in our records. Can not add duplication designation."
                        });
                    } else {
                        const hierarchy = new Hierarchy(body);
                        await hierarchy.save();

                        if (hierarchy) {
                            return response.send({
                                status: true,
                                message: "Hierarchy details has been saved successfully."
                            });
                        } else {
                            return response.send({
                                status: false,
                                message: "Something went wrong. Designation has not been created."
                            });
                        }
                    }
                }
            }
        );
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

//get hierarchy
exports.get_by_parent = async function(request, response) {
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
        var userObj = {
            path: "user_id"
        };
        var hierarchyObj = {
            path: "hierarchy_id"
        };

        UsersDesignation.find({ parent_user_id: body.parent_user_id })
            .populate(userObj)
            .populate(hierarchyObj)
            .exec(function(error, records) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    return response.status(201).send({
                        status: true,
                        data: records
                    });
                }
            });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

module.exports.structure = async function(request, response) {
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
        Hierarchy.aggregate(
            [{
                $lookup: {
                    from: "users_desginations",
                    localField: "_id",
                    foreignField: "hierarchy_id",
                    as: "usersdesginations"
                }
            }],
            function(error, results) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong"
                    });
                } else {
                    if (results && results.length > 0) {
                        results = JSON.parse(JSON.stringify(results));

                        var responseData = getParentChild(results);
                        return response.send({
                            status: true,
                            data: responseData
                        });
                    } else {
                        return response.send({
                            status: false,
                            message: "Details has not been found."
                        });
                    }
                }
            }
        );

        // Hierarchy.find({ parent_user_id: body.parent_user_id }, { parent_hierarchy_id: 1, designation: 1 }, function(error, results) {
        //     if (error) {
        //         return response.send({
        //             status: false,
        //             message: "Something went wrong"
        //         });
        //     } else {
        //         if (results && results.length > 0) {
        //             results = JSON.parse(JSON.stringify(results));

        //             var responseData = getParentChild(results);
        //             return response.send({
        //                 status: true,
        //                 data: responseData
        //             });
        //         } else {
        //             return response.send({
        //                 status: false,
        //                 message: "Details has not been found."
        //             });
        //         }
        //     }
        // });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }

    function getParentChild(records) {
        var root = [];

        records.forEach(element => {
            // No parentId means top level
            if (!element.parent_hierarchy_id) {
                return root.push(element);
            }

            // Insert element as child of parent in records array
            const parentIndex = records.findIndex(
                el => el._id == element.parent_hierarchy_id
            );

            if (!records[parentIndex].children) {
                return (records[parentIndex].children = [element]);
            }

            records[parentIndex].children.push(element);
        });

        return root;
    }
};

module.exports.getHierarchyUsers_old = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
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
            path: "user_id"
        };
        var hierarchyObj = {
            path: "hierarchy_id"
        };

        UsersDesignation.find({ parent_user_id: body.parent_user_id })
            .populate(userObj)
            .populate(hierarchyObj)
            .exec(function(error, records) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    if (records && records.length > 0) {
                        var hierarchyStructure = [];

                        asyncLoop.each(
                            records,
                            function(element, callback) {
                                var designation = element.hierarchy_id.designation;
                                var child_user_name =
                                    element.user_id.first_name + " " + element.user_id.last_name;
                                var parent_user_name = "";

                                if (element.hierarchy_id.user_id) {
                                    var userObj = {
                                        path: "user_id"
                                    };

                                    UsersDesignation.findOne({
                                            _id: element.hierarchy_id.user_id
                                        })
                                        .populate(userObj)
                                        .exec(function(error, users) {
                                            if (!error && users) {
                                                parent_user_name =
                                                    users.user_id.first_name +
                                                    " " +
                                                    users.user_id.last_name;
                                            }
                                            hierarchyStructure.push([
                                                child_user_name,
                                                parent_user_name,
                                                designation
                                            ]);
                                            callback();
                                        });
                                } else {
                                    hierarchyStructure.push([
                                        child_user_name,
                                        parent_user_name,
                                        designation
                                    ]);
                                    callback();
                                }
                            },
                            function(error) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong."
                                    });
                                } else {
                                    return response.send({
                                        status: true,
                                        data: hierarchyStructure
                                    });
                                }
                            }
                        );
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

module.exports.getHierarchyUsers = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        //Find hierarchy ids from hierarchy table
        Hierarchy.find({
                $or: [
                    { _id: body.hierarchy_id },
                    { parent_hierarchy_id: body.hierarchy_id }
                ]
            }, { _id: 1 },
            function(error, results) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    if (results && results.length > 0) {
                        var hierarchyId = results.map(data => data._id);
                        var userObj = {
                            path: "user_id"
                        };
                        var hierarchyObj = {
                            path: "hierarchy_id"
                        };

                        //Get all the details of users and hierachy
                        UsersDesignation.find({ hierarchy_id: { $in: hierarchyId } })
                            .populate(userObj)
                            .populate(hierarchyObj)
                            .exec(function(error, records) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong."
                                    });
                                } else {
                                    if (records && records.length > 0) {
                                        var hierarchyStructure = [];

                                        asyncLoop.each(
                                            records,
                                            function(element, callback) {
                                                var designation = element.hierarchy_id.designation;
                                                var child_user_name =
                                                    element.user_id.first_name +
                                                    " " +
                                                    element.user_id.last_name;
                                                var parent_user_name = "";

                                                var child_user_html = `<p>${child_user_name}</p><p>${designation}</p>`;

                                                if (element.hierarchy_id.user_id) {
                                                    var userObj = {
                                                        path: "user_id"
                                                    };
                                                    var hierarchyObj = {
                                                        path: "hierarchy_id"
                                                    };

                                                    //Fetch all the details of parent users and hierachy
                                                    UsersDesignation.findOne({
                                                            _id: element.hierarchy_id.user_id
                                                        })
                                                        .populate(userObj)
                                                        .populate(hierarchyObj)
                                                        .exec(function(error, users) {
                                                            if (!error && users) {
                                                                var parent_designation =
                                                                    users.hierarchy_id.designation;
                                                                parent_user_name =
                                                                    users.user_id.first_name +
                                                                    " " +
                                                                    users.user_id.last_name;

                                                                var parent_user_html = `<p>${parent_user_name}</p><p>${parent_designation}</p>`;
                                                                hierarchyStructure.push([
                                                                    child_user_html,
                                                                    parent_user_html,
                                                                    designation
                                                                ]);
                                                                callback();
                                                            }
                                                        });
                                                } else {
                                                    hierarchyStructure.push([
                                                        child_user_html,
                                                        parent_user_name,
                                                        designation
                                                    ]);
                                                    callback();
                                                }
                                            },
                                            function(error) {
                                                if (error) {
                                                    return response.send({
                                                        status: false,
                                                        message: "Something went wrong."
                                                    });
                                                } else {
                                                    return response.send({
                                                        status: true,
                                                        data: hierarchyStructure
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        return response.send({
                                            status: false,
                                            message: "User details has not been found."
                                        });
                                    }
                                }
                            });
                    } else {
                        return response.send({
                            status: false,
                            message: "User details has not been found."
                        });
                    }
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

module.exports.getHierarchyDesignations = function(request, response) {
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
        Hierarchy.find({ parent_user_id: body.parent_user_id }, function(
            error,
            records
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (records && records.length > 0) {
                    var hierarchyStructure = [];

                    asyncLoop.each(
                        records,
                        function(element, callback) {
                            var child_designation = element.designation;
                            var parent_designation = "";

                            if (element.parent_hierarchy_id) {
                                Hierarchy.findById(element.parent_hierarchy_id, function(
                                    error,
                                    parent_designations
                                ) {
                                    if (!error && parent_designations) {
                                        parent_designation = parent_designations.designation;
                                    }
                                    hierarchyStructure.push([
                                        child_designation,
                                        parent_designation,
                                        element._id
                                    ]);
                                    callback();
                                });
                            } else {
                                hierarchyStructure.push([
                                    child_designation,
                                    parent_designation,
                                    element._id
                                ]);
                                callback();
                            }
                        },
                        function(error) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                return response.send({
                                    status: true,
                                    data: hierarchyStructure
                                });
                            }
                        }
                    );
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

module.exports.get_by_user = function(request, response) {
    var body = request.body;
    console.log("body", body)
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
        //Get all the details of users and hierachy
        UsersDesignation.findOne({ user_id: body.user_id }).exec(function(
            error,
            record
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (record) {
                    var hierarchy_id = record.hierarchy_id;

                    //Find hierarchy ids from hierarchy table
                    Hierarchy.find({
                            $or: [
                                { _id: hierarchy_id },
                                { parent_hierarchy_id: hierarchy_id }
                            ]
                        }, { _id: 1 },
                        function(error, results) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                if (results && results.length > 0) {
                                    var hierarchyId = results.map(data => data._id);
                                    var userObj = {
                                        path: "user_id"
                                    };
                                    var hierarchyObj = {
                                        path: "hierarchy_id"
                                    };

                                    //Get all the details of users and it's designations
                                    UsersDesignation.find({ hierarchy_id: { $in: hierarchyId } })
                                        .populate(userObj)
                                        .populate(hierarchyObj)
                                        .exec(function(error, records) {
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
                                } else {
                                    return response.send({
                                        status: false,
                                        message: "User details has not been found."
                                    });
                                }
                            }
                        }
                    );
                } else {
                    return;
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


// NEEDS CONTEXT AND REPAIRS
// Executes on init of item-plan-details
// Does this relate to the role_id problem?
module.exports.get_child_designation = function(request, response) {
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
        console.log(request.body)
        //Get all the details of users and hierachy
        UsersDesignation.findOne({ user_id: body.user_id }).exec(function(
            error,
            record
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (record) {
                    var hierarchy_id = record.hierarchy_id;

                    //Find hierarchy ids from hierarchy table
                    Hierarchy.find({ parent_hierarchy_id: hierarchy_id }, function(
                        error,
                        results
                    ) {
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
                } else {
                    return;
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

// Get user's all child users.
module.exports.get_user_child = async function(request, response) {
    var body = request.body;
    var errors = [];

    var outputArray = [];

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
        //Get all the details of users and hierachy
        UsersDesignation.findOne({ user_id: body.user_id }).exec(function(
            error,
            record
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (record) {
                    var hierarchy_id = record.hierarchy_id;

                    //Find hierarchy ids from hierarchy table
                    Hierarchy.find({ parent_hierarchy_id: hierarchy_id }, async function(
                        error,
                        results
                    ) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            if (results && results.length > 0) {
                                await getChild(results);

                                async function getChild(results) {
                                    outputArray.push(results);

                                    for await (const element of results) {
                                        //Find hierarchy ids from hierarchy table
                                        var records = await Hierarchy.find({ parent_hierarchy_id: element._id });

                                        if (records && records.length > 0) {
                                            await getChild(records);
                                        }
                                    }
                                }

                                var childerArr = [];

                                await outputArray.map(data => {
                                    data.map(element => {
                                        childerArr.push(element._id);
                                    });
                                });

                                await UsersDesignation.find({ hierarchy_id: { $in: childerArr } }, { user_id: 1, _id: 0 },
                                    function(error, userIds) {
                                        if (error) {
                                            return response.send({
                                                status: false,
                                                message: "Something went wrong."
                                            });
                                        } else {
                                            return response.send({
                                                status: true,
                                                data: userIds
                                            });
                                        }
                                    }
                                );
                            } else {
                                return response.send({
                                    status: false,
                                    message: "Hiearachy details has not been found."
                                });
                            }
                        }
                    });
                } else {
                    return response.send({
                        status: false,
                        message: "Designation not found."
                    });
                }
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

module.exports.get_user_parents = async function(request, response) {
    var body = request.body;
    var errors = [];
    var outputArray = [];

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
        var hierarchyObj = {
            path: "hierarchy_id"
        };

        UsersDesignation.findOne({ user_id: body.user_id }).populate(hierarchyObj).exec(async function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result) {
                    if (result.hierarchy_id.parent_hierarchy_id) {
                        await getParent(result.hierarchy_id);

                        async function getParent(hierarchy) {
                            outputArray.push(hierarchy);

                            if (hierarchy.parent_hierarchy_id) {
                                await Hierarchy.findOne({ _id: hierarchy.parent_hierarchy_id }, async function(error, record) {
                                    if (!error && record) {
                                        await getParent(record);
                                    }
                                });
                            } else {
                                var hierarchyIds = await outputArray.map(data => data._id);

                                await UsersDesignation.find({ hierarchy_id: { $in: hierarchyIds } }, { user_id: 1, _id: 0 },
                                    function(error, userIds) {
                                        if (error) {
                                            return response.send({
                                                status: false,
                                                message: "Something went wrong."
                                            });
                                        } else {
                                            return response.send({
                                                status: true,
                                                data: userIds,

                                            });
                                        }
                                    }
                                );
                            }
                        }
                    } else {
                        return response.send({
                            status: true,
                            data: []
                        });
                    }
                } else {
                    return response.send({
                        status: false,
                        message: "User details has not been found."
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
 * This function return designations.
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-13
 */
module.exports.getHierarchyDesignationsByParent = function(request, response) {
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
        Hierarchy.find({ parent_user_id: body.parent_user_id }, function(
            error,
            records
        ) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (records && records.length > 0) {
                    var hierarchyStructure = [];

                    asyncLoop.each(
                        records,
                        function(element, callback) {
                            var child_designation = element.designation;
                            var parent_designation = "";

                            if (element.parent_hierarchy_id) {
                                Hierarchy.findById(element.parent_hierarchy_id, function(
                                    error,
                                    parent_designations
                                ) {
                                    if (!error && parent_designations) {
                                        parent_designation = parent_designations.designation;
                                    }
                                    hierarchyStructure.push([
                                        child_designation,
                                        parent_designation,
                                        element._id,
                                        element.created_at
                                    ]);
                                    callback();
                                });
                            } else {
                                hierarchyStructure.push([
                                    child_designation,
                                    parent_designation,
                                    element._id,
                                    element.created_at
                                ]);
                                callback();
                            }
                        },
                        function(error) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                return response.send({
                                    status: true,
                                    data: hierarchyStructure
                                });
                            }
                        }
                    );
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
 * This function return user added designations.
 *
 * @param plan_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-13
 */
module.exports.getHierarchyDesignationsByUser = function(request, response) {
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
        UsersDesignation.findOne({ user_id: body.user_id }, function(error, user) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (user) {
                    Hierarchy.find({ parent_hierarchy_id: user.hierarchy_id }, function(
                        error,
                        records
                    ) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            if (records && records.length > 0) {
                                var hierarchyStructure = [];

                                asyncLoop.each(
                                    records,
                                    function(element, callback) {
                                        var child_designation = element.designation;
                                        var parent_designation = "";

                                        if (element.parent_hierarchy_id) {
                                            Hierarchy.findById(element.parent_hierarchy_id, function(
                                                error,
                                                parent_designations
                                            ) {
                                                if (!error && parent_designations) {
                                                    parent_designation = parent_designations.designation;
                                                }
                                                hierarchyStructure.push([
                                                    child_designation,
                                                    parent_designation,
                                                    element._id,
                                                    element.created_at
                                                ]);
                                                callback();
                                            });
                                        } else {
                                            hierarchyStructure.push([
                                                child_designation,
                                                parent_designation,
                                                element._id,
                                                element.created_at
                                            ]);
                                            callback();
                                        }
                                    },
                                    function(error) {
                                        if (error) {
                                            return response.send({
                                                status: false,
                                                message: "Something went wrong."
                                            });
                                        } else {
                                            return response.send({
                                                status: true,
                                                data: hierarchyStructure
                                            });
                                        }
                                    }
                                );
                            } else {
                                return response.send({
                                    status: false,
                                    message: "User details has not been found"
                                });
                            }
                        }
                    });
                } else {

                    return response.send({
                        status: false,
                        message: "User details has not been found"
                    });
                }
            }
        });
        return false;
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function update designations.
 *
 * @param _id(hierarchy id), designation
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 * @modified 2020-03-12
 */
module.exports.updateDesignation = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body._id) {
        errors.push(["Id is required"]);
    }

    if (!body.designation) {
        errors.push(["Designation is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.findById(body._id, function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result && !result.parent_hierarchy_id && result.parent_hierarchy_id == '') {
                    Hierarchy.updateOne({ _id: body._id }, { designation: body.designation }, function(error, records) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            return response.send({
                                status: true,
                                message: "Hierarchy has been updated successfully."
                            });
                        }
                    });
                } else {
                    if (body.parent_hierarchy_id && body.parent_hierarchy_id != '') {
                        UsersDesignation.findOne({ hierarchy_id: body.parent_hierarchy_id }).sort({ "created_at": -1 }).exec(function(error, result) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                if (result) {
                                    var data = {
                                        user_id: result._id,
                                        parent_hierarchy_id: result.hierarchy_id,
                                        designation: body.designation
                                    };

                                    Hierarchy.updateOne({ _id: body._id }, data, function(error, records) {
                                        if (error) {
                                            return response.send({
                                                status: false,
                                                message: "Something went wrong."
                                            });
                                        } else {
                                            return response.send({
                                                status: true,
                                                message: "Hierarchy has been updated successfully."
                                            });
                                        }
                                    });
                                } else {
                                    return response.send({
                                        status: false,
                                        message: "Assign any user to selected superior designation."
                                    });
                                }
                            }
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong."
                        });
                    }
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
 * This function remove requested designation and update requested designation's parent id into requested designation's childs.
 *
 * @param hierarchy_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.deleteHierarchy = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.findById(body.hierarchy_id, async function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result) {
                    if (result.parent_hierarchy_id) {
                        var parent_hierarchy_id = result.parent_hierarchy_id;

                        Hierarchy.remove({ _id: result._id }, async function(error, is_remove) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Can not remove this designation."
                                });
                            } else {
                                var childHierarchy = await Hierarchy.find({ parent_hierarchy_id: result._id });

                                if (childHierarchy && childHierarchy.length > 0) {
                                    var getChildHierarchyIds = childHierarchy.map(data => data._id);
                                    var getParentHiearchy = await UsersDesignation.findOne({ hierarchy_id: parent_hierarchy_id });

                                    await Hierarchy.updateMany({ _id: { $in: getChildHierarchyIds } }, {
                                        parent_hierarchy_id: parent_hierarchy_id,
                                        user_id: getParentHiearchy._id
                                    });

                                    await UsersDesignation.deleteMany({ hierarchy_id: result._id }, function(error, is_delete) {
                                        if (!error && is_delete) {
                                            return response.send({
                                                status: true,
                                                message: "Designation has been removed successfully."
                                            });
                                        }
                                    });
                                } else {
                                    UsersDesignation.deleteMany({ hierarchy_id: result._id }, function(error, is_delete) {
                                        if (!error && is_delete) {
                                            return response.send({
                                                status: true,
                                                message: "Designation has been removed successfully."
                                            });
                                        }
                                    });
                                }
                            }
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Can not remove this designation."
                        });
                    }
                } else {
                    return response.send({
                        status: false,
                        message: "Hierarchy details has not been found."
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
 * This function update designation in organization hierarchy.
 *
 * @param designation, user_id, parent_user_id, parent_hierarchy_id, assign_designations
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.updateHierarchy = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.designation) {
        errors.push(["Designation is required"]);
    }

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (!body.parent_hierarchy_id) {
        errors.push(["Parent hierarchy id is required"]);
    }

    if (!body.assign_designations) {
        errors.push(["Assign designations is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.find({
            parent_user_id: body.parent_user_id,
            designation: body.designation
        }, async function(error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (records && records.length > 0) {
                    return response.send({
                        status: false,
                        message: "Designation is already exists in our records. Can not add duplication designation."
                    });
                } else {
                    const hierarchy = new Hierarchy({
                        designation: body.designation,
                        user_id: body.user_id,
                        parent_user_id: body.parent_user_id,
                        parent_hierarchy_id: body.parent_hierarchy_id
                    });
                    await hierarchy.save();

                    if (hierarchy) {
                        var parent_hierarchy_id = hierarchy._id;
                        var assign_designations_ids = body.assign_designations.map(data => data._id);
                        var get_parent_hiearchy = await UsersDesignation.findOne({ hierarchy_id: parent_hierarchy_id });

                        Hierarchy.updateMany({ _id: { $in: assign_designations_ids } }, { parent_hierarchy_id: parent_hierarchy_id }, function(error, result) {
                            if (error) {
                                return response.send({
                                    status: false,
                                    message: "Something went wrong."
                                });
                            } else {
                                return response.send({
                                    status: true,
                                    message: "Hierarchy details has been updated successfully."
                                });
                            }
                        })
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong. Designation has not been created."
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
}

/**
 * This function update user designation.
 *
 * @param user_id, parent_user_id, hierarchy_id
 * @author  Hardik Gadhiya
 * @version 1.0
 * @since   2020-02-19
 */
module.exports.changeUserDesignation = function(request, response) {
    var body = request.body;
    var errors = [];

    if (!body.user_id) {
        errors.push(["User id is required"]);
    }

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        UsersDesignation.findOne({ user_id: body.user_id }, async function(error, result) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (result) {
                    await UsersDesignation.updateOne({ _id: result._id }, { hierarchy_id: body.hierarchy_id }, async function(error, is_update) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong with desingation updation."
                            });
                        } else {
                            var user_id = result._id;
                            await updateChildHierarchy(user_id, body.hierarchy_id);

                            return response.send({
                                status: true,
                                message: "User's designation has been updated successfully."
                            });
                        }
                    })
                } else {
                    var userDesignation = new UsersDesignation(body);
                    userDesignation.save();

                    if (userDesignation) {
                        var user_id = userDesignation._id;
                        await updateChildHierarchy(user_id, body.hierarchy_id);

                        return response.send({
                            status: true,
                            message: "User's designation has been updated successfully."
                        });
                    } else {
                        return response.send({
                            status: false,
                            message: "Something went wrong with desingation updation."
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

    function updateChildHierarchy(user_id, hierarchy_id) {
        Hierarchy.find({ parent_hierarchy_id: hierarchy_id }, function(error, results) {
            if (!error && results && results.length > 0) {
                var hierarchy_ids = results.map(data => data._id);

                Hierarchy.updateMany({ _id: { $in: hierarchy_ids } }, { user_id: user_id }, function(error, result) {
                    console.log(error)
                    console.log(result)
                });
            }
        })

    }
}

/**
 * This function get all designations.
 *
 * @param parent_user_id, hierarchy_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-12
 */
exports.getAllDesignations = async function(request, response) {
    var body = request.body;

    var errors = [];

    if (!body.parent_user_id) {
        errors.push(["Parent user id is required"]);
    }

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.find({
            parent_user_id: body.parent_user_id,
            _id: {
                $ne: body.hierarchy_id
            }
        }, function(error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.status(201).send({
                    status: true,
                    data: records
                });
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function get hierarchy's parent hierarchy.
 *
 * @param parent_user_id, hierarchy_id
 * @author  Hardik Gadhiya
 * @version 2.0
 * @since   2020-03-12
 */
exports.getParentDesignation = async function(request, response) {
    var body = request.body;

    var errors = [];

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        Hierarchy.findById(body.hierarchy_id, function(error, records) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                if (records && records.parent_hierarchy_id) {
                    Hierarchy.findById(records.parent_hierarchy_id, function(error, element) {
                        if (error) {
                            return response.send({
                                status: false,
                                message: "Something went wrong."
                            });
                        } else {
                            return response.status(201).send({
                                status: true,
                                data: element
                            });
                        }
                    })
                } else {
                    return response.status(201).send({
                        status: true,
                        data: ''
                    });
                }
            }
        });
    } catch (err) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
};

/**
 * This function get user's child hierarchy.
 *
 * @param parent_user_id, hierarchy_id
 * @author  Hardik Gadhiya
 * @version 5.0
 * @since   2020-05-06
 */
module.exports.getUserAllChildHierarchy = function(request, response) {
    var body = request.body;
    var errors = [];
    var hierarchyId = [];

    if (!body.hierarchy_id) {
        errors.push(["Hierarchy id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
        //Find hierarchy ids from hierarchy table
        Hierarchy.find({
                $or: [
                    { _id: body.hierarchy_id },
                    { parent_hierarchy_id: body.hierarchy_id }
                ]
            },
            async function(error, results) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    if (results && results.length > 0) {

                        await getHierarchyId(results);

                        var userObj = {
                            path: "user_id"
                        };
                        var hierarchyObj = {
                            path: "hierarchy_id"
                        };

                        //Get all the details of users and hierachy
                        UsersDesignation.find({ hierarchy_id: { $in: hierarchyId } })
                            .populate(userObj)
                            .populate(hierarchyObj)
                            .exec(function(error, records) {
                                if (error) {
                                    return response.send({
                                        status: false,
                                        message: "Something went wrong."
                                    });
                                } else {
                                    if (records && records.length > 0) {
                                        var hierarchyStructure = [];

                                        asyncLoop.each(
                                            records,
                                            function(element, callback) {
                                                var designation = element.hierarchy_id.designation;
                                                var child_user_name =
                                                    element.user_id.first_name +
                                                    " " +
                                                    element.user_id.last_name;
                                                var parent_user_name = "";

                                                var child_user_html = `<p>${child_user_name}</p><p>${designation}</p>`;

                                                if (element.hierarchy_id.user_id) {
                                                    var userObj = {
                                                        path: "user_id"
                                                    };
                                                    var hierarchyObj = {
                                                        path: "hierarchy_id"
                                                    };

                                                    //Fetch all the details of parent users and hierachy
                                                    UsersDesignation.findOne({
                                                            _id: element.hierarchy_id.user_id
                                                        })
                                                        .populate(userObj)
                                                        .populate(hierarchyObj)
                                                        .exec(function(error, users) {
                                                            if (!error && users) {
                                                                var parent_designation =
                                                                    users.hierarchy_id.designation;
                                                                parent_user_name =
                                                                    users.user_id.first_name +
                                                                    " " +
                                                                    users.user_id.last_name;

                                                                var parent_user_html = `<p>${parent_user_name}</p><p>${parent_designation}</p>`;
                                                                hierarchyStructure.push([
                                                                    child_user_html,
                                                                    parent_user_html,
                                                                    designation
                                                                ]);
                                                                callback();
                                                            }
                                                        });
                                                } else {
                                                    hierarchyStructure.push([
                                                        child_user_html,
                                                        parent_user_name,
                                                        designation
                                                    ]);
                                                    callback();
                                                }
                                            },
                                            function(error) {
                                                if (error) {
                                                    return response.send({
                                                        status: false,
                                                        message: "Something went wrong."
                                                    });
                                                } else {
                                                    return response.send({
                                                        status: true,
                                                        data: hierarchyStructure
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        return response.send({
                                            status: false,
                                            message: "User details has not been found."
                                        });
                                    }
                                }
                            });
                    } else {
                        return response.send({
                            status: false,
                            message: "User details has not been found."
                        });
                    }
                }
            }
        );
    } catch (error) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }


    async function getHierarchyId(hierarchy_ids) {
        var ids = hierarchy_ids.map(data => data._id);
        var results = await Hierarchy.find({ parent_hierarchy_id: { $in: ids } });

        if (results && results.length > 0) {
            await getHierarchyId(results);

            hierarchy_ids.forEach(function(element) {
                hierarchyId.push(element._id);
            });
        }
    }
};

/**
 * This function get user's designation.
 *
 * @param parent_user_id, hierarchy_id
 * @author  Hardik Gadhiya
 * @version 5.0
 * @since   2020-05-06
 */
exports.getUserDesignation = function(request, response) {
    var body = request.body;

    if (!body.user_id) {
        return response.send({
            status: false,
            message: "User id is required"
        });
    }

    try {
        var hierarchyObj = {
            path: 'hierarchy_id'
        };

        UsersDesignation.findOne({ user_id: body.user_id }).populate(hierarchyObj).exec(function(error, record) {
            if (error) {
                return response.send({
                    status: false,
                    message: "Something went wrong."
                });
            } else {
                return response.send({
                    status: true,
                    data: record
                });
            }
        });
    } catch (error) {
        return response.send({ status: false, message: "Something went wrong" });
    }
};