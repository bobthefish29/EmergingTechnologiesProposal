//importing bullMQ's queu, and IoRedis
const { Queue } = require('bullmq');
const connection = require('../configs/connection.js');

//giving the que the connection
const chatQueue = new Queue('chatQueue', {
    connection
});

module.exports = chatQueue;