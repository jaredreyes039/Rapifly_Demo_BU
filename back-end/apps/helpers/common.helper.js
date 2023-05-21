const mongoose = require('mongoose');

/**
 * This function create dynamic schema in mongo
 *
 * @param modelName, model
 * @author  Hardik Gadhiya
 * @version 3.0
 * @since   2020-03-20
 */
function createNewModel(modelName, model) {
    const Schema = mongoose.Schema;

    if (mongoose.models && mongoose.models[modelName] == undefined) {
        // while req.body.model contains your model definition
        mongoose.model(modelName, new Schema(model));
    }

    return true;
}

/** 
 * Random string generator
 **/
function stringGenerator(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports.createNewModel = createNewModel;
module.exports.stringGenerator = stringGenerator;