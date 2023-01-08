console.log('\n -----BEGIN SERVER LOG \n');
let express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const cors = require('cors');

let PlanController = require('./apps/controllers/plans.controller')
let GoalController = require('./apps/controllers/goals.controller')

let app = express();

let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
// Set up mongoose connection
const mongoDB = process.env.MONGO_URI || "mongodb+srv://jaredreyes039:L2HMZuhcsaQ7hne5@rapifly.jaup042.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
    if(!err){
        console.log(`Server: Connected to MongoDB on port: ${process.env.PORT || 3000}`)
    }
});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload());
app.use(express.static(__dirname + '/public'));
app.use(cors());

const port = process.env.PORT || 3000;

io.on('connection', (socket) => {
    //Send and recieve message and upload chat attachment for plan
    socket.on("new-message", async (data) => {
        var planChatDetails = await PlanController.sendMessage(data);
        if (planChatDetails) {
            await io.emit("new-message", {data: planChatDetails});
        }
    });

    //Send and receive message and upload chat attachment for goal
    socket.on("goal-new-message", async (data) => {
        var goalChatDetails = await GoalController.sendMessage(data);
        if (goalChatDetails) {
            await io.emit("goal-new-message", {data: goalChatDetails});
        }
    });

    //Send and receive message and upload chat attachment for strategy
    socket.on("strategy-new-message", async (data) => {
        var strategyChatDetails = await GoalController.sendStrategyMessage(data);
        if (strategyChatDetails) {
            await io.emit("strategy-new-message", {data: strategyChatDetails});
        }
    });
    
    //Send and receive message and upload chat attachment for challange
    socket.on("challange-new-message", async (data) => {
        var challangeChatDetails = await PlanController.sendChallangeMessage(data);
        if (challangeChatDetails) {
            await io.emit("challange-new-message", {data: challangeChatDetails});
        }
    });
});

server.listen(port, () => {
    console.log(`Sever opened on: ${port}`);
});

