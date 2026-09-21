const connection = require('../configs/connection.js');
//Ping server, before week 10, it would be cool to add like a admin for the user so they can are the only people who can ping the server
async function redisStatus() {
    try {
        //does a ping, return is a pong
        const result = await connection.ping();
        //If status is pong then server is online
        return {
            online: result === "PONG",
            response: result
        };

    } catch (error) {
        //
        return {
            online: false,
            response: error.message
        };

    }
}


module.exports = {
    redisStatus,
};