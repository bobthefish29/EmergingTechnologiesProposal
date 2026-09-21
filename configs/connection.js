const IORedis = require('ioredis');
require("dotenv").config();


//Week Seven Change. Added Host and port as env imports
//Setting the Redis connection. This is running on a docker container
const connection = new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null
});


module.exports = connection;