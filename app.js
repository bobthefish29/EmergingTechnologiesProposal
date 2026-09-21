const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

//vars
const path = require("path");
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server)

//routers
const chatRouter = require("./router/chat");

//HBS
const { engine } = require("express-handlebars")
app.engine("hbs", engine({
    extname: ".hbs"
}))
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//adding the que from bullMQ
const chatQueue = require("./queues/chatQueue");
const { QueueEvents } = require("bullmq");
const connection = require('./configs/connection.js');
const queueEvents = new QueueEvents("chatQueue", { connection });


//This is waiting until the the workers have completed. Than its emiting the result back to the user
//----Class DEMO 2.1 -- Allows users to have there own chat messages
queueEvents.on("completed", async ({ jobId }) => {

    
    const job = await chatQueue.getJob(jobId);

    if (!job){
        return;
    }

    const result = job.returnvalue;

    if (result){
        const socketId = job.data.socketId;
        //----Class DEMO 2.1. Now if user A and B ask a questions, user A will now get there responce and not user B responce
        io.to(socketId).emit(
            "chat message",
            result
        );
    }
});

//sockets
io.on("connection", (socket) => {
    //Sending the message to the worker
    socket.on("bot message", async (msg) => {

        const job = await chatQueue.add("botJob", { message: msg, socketId: socket.id });

        console.log(`Job Queued ${job.id}`)
    });
    //console.log("user connected");
    socket.on("chat message", (msg) => {
        io.emit("chat message", {text: msg});
    });
});


//adding routers
app.use("/", chatRouter);
app.use((req, res) => {
    res.redirect("/");
});
//Week Seven Change. Adding 0.0.0.0. to allow connections from outside the server
server.listen(PORT, "0.0.0.0", () => {
    console.log(`The server is running on port: ${PORT}`);
});