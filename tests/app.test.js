// Test cases for the chatbot application


const request = require('supertest');
const app = require('../app');


describe("Chatbot application", () => {

    test("The application responds", async () => {
        const response = await request(app).get("/");

        expect(response.status).toBe(200);
    });

});