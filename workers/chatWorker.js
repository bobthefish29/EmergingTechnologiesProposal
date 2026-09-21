require("dotenv").config();
//Importing workers
const { Worker } = require('bullmq');
const OpenAI = require("openai")
const client = new OpenAI();
const connection = require('../configs/connection.js');

//DEMO---IMPORTS
// Basic Funcitons
const { getTime, calculate } = require("../functions/basicFunctions.js")
//API Functions
const {getWeather, getCatFact} = require('../functions/apiFunctions.js')
//server imports
const {redisStatus} = require("../functions/serverFunctions.js")


//------Class Demo--------Definded functions--------------
//BasicTools, could just remove this for the demo
const tools = [
    //Get time
    {
        //Basic function. Need to define a type, name, and desc of what the function can do
        type: "function",
        name: "get_time",
        description: "Gets the current time",
        parameters: {
            type: "object",
            properties: {},
            required: [],
            additionalProperties: false
        },
        strict: true
    },
    //CLASS DEMO ----------- Documnted tool
    {
        type: "function",
        name: "calculate",
        description: "Does math on two numbers, the user will give the sign",
        parameters:{
            //The parmaters must be an object
            //This means the AI will send the inputs as key:value pairs
            //Example {a:10, b:4, sign:"2"}
            type: "object",
            properties:{
                //Number means A has to be a number, a string will not work
                a:{
                    type: "number",
                    description: "First Number"
                },
                b:{
                    type: "number",
                    description: "Second Number"
                },
                //The operation that the AI will send (+ - * /)
                sign:{
                    type: "string",
                    description: "The sign that will be used in the math problum"
                }
            },
            //Required means that A,B,sign have to be there. If they are not the function wont run

            required: ["a", "b", "sign"],

            //no additional propties can be sent. 
            //{a:10, b:4, sign:"2", name:"Peter Griffin"} would not work
            additionalProperties: false
        },
        //strict: true makes the function follow the parameter exactly.
        //This means the arguments must match the defined structure and types.
        strict: true
    }
]

//All API call tools
const APItools = [
    //Get weather function the ai knows
    {
        
        type: "function",
        name: "get_weather",
        description: "Get the current weather for a location.",
        parameters:{
            type: "object",
            properties:{
                location:{
                    type: "string",
                    description: "The city and country to get the weather for."
                }
            },
            required: ["location"],
            additionalProperties: false
        },
        strict: true
    },
    {
        type: "function",
        name: "get_CatFact",
        description: "Gets a random cat fact.",
    }
];


const serverTools = [
    {
        type: "function",
        name: "redis_status",
        description: "Check whether the Redis server is online and responding.",
        parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
        },
        strict: true
    }
]

tools.push(...serverTools)
tools.push(...APItools)
// tools.push(...newsTools)

//Registering the functions
//Name Of tool : Function it's self
const functions = {
    get_weather: getWeather,
    get_CatFact: getCatFact,
    get_time: getTime,
    calculate: calculate,

    redis_status: redisStatus,
};






//This is asigning the worker to the chatQueue i made in the que
const worker = new Worker('chatQueue', async (job) => {

        //Just the content the user said, Low key should clean this to be something better then just the message
        const { message } = job.data;

        
        let input = [{role: "user", content: message}];


        //First AI call, this is sending the message and all the tools the AI has
        let response = await client.responses.create({
            model: "gpt-3.5-turbo",
            tools: tools,
            input: input
        });


        //Adding the full responce to input
        input.push(...response.output);


        //Checking 
        for(const item of response.output) {

            //Check to see if there were any funcitons calls in the responce, if there are not does not call anything
            if(item.type !== "function_call") {
                continue;
            }

            //Setting the function that was found. If get_weather is called, foundFunction becomes the caller for getweather
            const foundFunction = functions[item.name];

            //Another check incase there is a found functions, but it does not know of it
            if(!foundFunction) {
                return{
                    text: "Sorry I can not complete that task right now. Please try again later.",
                    username: "bot"
                };
            }

            //getting the args (parameters) that was apeart of the chat message
            const args = JSON.parse(item.arguments);

            //calling the found functions with the arguments
            const result = await foundFunction(args);

            //This is the output of the functions. If it called the weather API, the responce is here
            input.push({
                type: "function_call_output",
                call_id: item.call_id,
                output: JSON.stringify(result)
            });
        }

        //Wired bug where is it was calling a message not a function call it would return black. 
        if(response.output[0].type === "function_call") {
            //Final chat call with the tool registred
            response = await client.responses.create({
                model: "gpt-3.5-turbo",
                tools: tools,
                input: input
            });
        }


        //returning the output from the bot back to the server to dispaly using socket
        return{
            text: response.output_text,
            username: "bot"
        };
    },{ connection, concurrency: 3 }
);


//This is somthing i would be able to make. THere a many different flags i can look for.
worker.on('completed', (job) => {
    console.log(`\nJob ${job.id} completed\n`);
});
worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed`, err);
});

console.log("Workers are online.")