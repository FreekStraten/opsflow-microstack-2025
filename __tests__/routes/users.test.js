const { ExpectationFailed } = require('http-errors'); // Not necessary for this test, but can be used for error handling

const request = require('supertest'); // Supertest enables HTTP requests in your tests
const app = require('../../app'); // Import your Express application (make sure this path is correct)

const { db, client } = require('../../services/database'); // Import your database connection

describe('User Routes', () => {
    // Before each test runs, clear the 'users' collection completely
    beforeEach(async () => {
        // Clear all users from the collection
        await db.collection('users').deleteMany({});

        // Wait and verify the collection is actually empty
        const count = await db.collection('users').countDocuments();
        if (count > 0) {
            console.warn(`Warning: Found ${count} users after cleanup, retrying...`);
            await db.collection('users').deleteMany({});
        }

        // Double-check it's empty
        const finalCount = await db.collection('users').countDocuments();
        expect(finalCount).toBe(0);
    });

    // After all tests, close the database connection properly
    afterAll(async () => {
        if (client) {
            await client.close();
        }

        // Clear any timers
        jest.clearAllTimers();

        // Give Node.js time to clean up
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Define a test for getting users
    it('should get all users in array format', async () => {
        // Create an object that you want to insert as a test user
        const expectedUser = { 'foo': 'bar' };

        // Add this object to the 'users' collection
        await db.collection('users').insertOne(expectedUser);

        // Since MongoDB automatically adds an _id to documents, remove it from our expected object for comparison
        delete expectedUser._id;

        // Make a GET request to the /users route with Supertest
        const res = await request(app).get('/users');

        // Check that the status code is 200 (OK)
        expect(res.statusCode).toEqual(200);

        // Check that there is exactly one user in the response (array length is 1)
        expect(res.body.length).toEqual(1);

        // Check that the first object in the array contains the properties as in expectedUser
        expect(res.body[0]).toEqual(expect.objectContaining(expectedUser));
    });
});