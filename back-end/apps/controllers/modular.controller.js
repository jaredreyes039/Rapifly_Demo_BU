const async1 = require("async");
const moment = require('moment');

const Modulars = require('../models/modulars.model');
const Plan = require("../models/plan.model");

exports.manage = async function (request, response) {
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
    	if (body.modular_id && body.modular_id !== '') {
        	Modulars.updateOne({_id: body.modular_id}, body, async function (error, level) {
                if (error) {
                    return response.send({
                        status: false,
                        message: "Something went wrong."
                    });
                } else {
                    return response.send({
                        status: true,
                        message: "Modular has been updated successfully."
                    });
                }
            });
        }else{
	    	var modular = new Modulars(body);
	    	modular.save();

	    	if(modular){
	    		return response.send({
	                status: true,
	                message: "Modular has been created successfully."
	            });
	    	}else{
	    		return response.send({
	                status: false,
	                message: "Something went wrong."
	            });
	    	}
    	}
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        })
    }
};

exports.getById = async function (request, response) {
	var body = request.body;

	var errors = [];

    if (!body.module_id) {
        errors.push(["Module id is required"]);
    }

    if (errors && errors.length > 0) {
        var message = errors.join(" , ");
        return response.send({
            status: false,
            message: message
        });
    }

    try {
    	Modulars.findOne({_id: body.module_id}, function(error, results) {
	    	if(error){
	    		return response.send({
		            status: false,
		            message: "Something went wrong."
		        });
	    	}else{
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

exports.getByPlan = async function (request, response) {
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
    	Plan.find({user_id: body.user_id}, function(error, plans) {
	    	if(error){
	    		return response.send({
		            status: false,
		            message: "Something went wrong."
		        });
	    	}else{
	    		if(plans && plans.length > 0){
	    			async1.each(plans, function (element, callback) {
	                    Modulars.find({plan_id: element._id}, function(error, modulars) {
	                        if (modulars && modulars.length > 0) {
	                            element.set("modulars", modulars, {strict: false});  
	                        }

	                        callback();
	                    });
	                }, function (err) {
			    		return response.send({
				            status: true,
				            data: plans
				        });
	                });
	    		}else{
		    		return response.send({
			            status: true,
			            data: plans
			        });
	    		}
	    	}
	    });
    } catch (e) {
        return response.send({
            status: false,
            message: "Something went wrong."
        });
    }
}