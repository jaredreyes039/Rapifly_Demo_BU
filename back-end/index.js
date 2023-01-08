const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const cors = require('cors');
const mongoose = require('mongoose');

const user = require('./apps/routes/users.routes');
const role = require('./apps/routes/roles.routes');
const organizations = require('./apps/routes/organizations.routes');

const plan = require('./apps/routes/plans.routes');
const levels = require('./apps/routes/levels.routes');
const organization_role = require('./apps/routes/organization_role.routes');
const domains = require('./apps/routes/domains.routes');
const hierarchy = require('./apps/routes/hierarchy.routes');
const goals = require('./apps/routes/goals.routes');
const delegation = require('./apps/routes/delegation.routes');
const propose = require('./apps/routes/propose.routes');
const report = require('./apps/routes/report.routes');
const user_group = require('./apps/routes/user_groups.routes');
const share_plans = require('./apps/routes/share_plans.routes');
const qa = require('./apps/routes/qa_forms.routes');
const clone = require("./apps/helpers/clone");
const coach = require("./apps/routes/coach.routes");
const modular = require("./apps/routes/modular.routes");
const modules = require("./apps/routes/modules.routes");
const logger = require('morgan')

//Setup enviroment file
require('dotenv').config({ path: __dirname + '/.env' })
var port = process.env['PORT'] || 3000;

// initialize our express app
const app = express();

// Set up mongoose connection
var url = "mongodb+srv://jaredreyes039:L2HMZuhcsaQ7hne5@rapifly.jaup042.mongodb.net/?retryWrites=true&w=majority";
const mongoDB = process.env.MONGO_URL || url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true }, (err)=>{
    if(!err){
        console.log(`Index: Connected to MongoDB on port: ${process.env.PORT || 3000}`)
    }
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(logger('dev'));
setInterval(() => {
    clone.countdownGoal();
    clone.setAlertForLaunch();
    clone.setAlertForReport();
    clone.checkdelegationtimeout();
}, 10000);

//Routes
app.use('/users', user);
app.use('/role', role);
app.use('/domain', domains);

app.use('/goal', goals);
app.use('/plan', plan);
app.use('/level', levels);
app.use('/organization/role', organization_role);
app.use('/organization', organizations);
app.use('/hierarchy', hierarchy);
app.use('/delegation', delegation);
app.use('/propose', propose);
app.use('/report', report);
app.use('/user_group', user_group);
app.use('/share_plan', share_plans);
app.use('/qa', qa);
app.use('/coach', coach);
app.use('/modular', modular);
app.use('/module', modules);

app.listen(port, () => {
    console.log('Server is up and running on port number ' + port);
});