// Test cases for the chatbot application


const request = require('supertest');
const app = require('../app');


describe("Chatbot application", () => {

    test("The application responds", async () => {
        const response = await request(app).get("/");
        //Uncomment this line to show what a faile would do in github actions and how the changes were not made live
        // expect(response.status).toBe(500);
        expect(response.status).toBe(200);
    });

});