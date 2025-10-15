const request = require('supertest');
const { MongoClient } = require('mongodb');

// Increase default Jest timeout to avoid CI flakiness
jest.setTimeout(20000);

// Set test environment before importing app
process.env.NODE_ENV = 'test';

// Do not override MONGO_URL; rely on @shelf/jest-mongodb preset
// Derive DB_NAME from MONGO_URL if not provided by the preset
if (!process.env.DB_NAME && process.env.MONGO_URL) {
    try {
        const u = new URL(process.env.MONGO_URL);
        const derived = u.pathname.replace(/^\//, '') || 'test';
        process.env.DB_NAME = derived;
    } catch {
        // leave undefined if parsing fails
    }
}

const app = require('../index');

describe('Notification Service', () => {
    let db;
    let client;

    // Setup before all tests
    beforeAll(async () => {
        // Ensure the service connects to the test DB
        if (app.__test && app.__test.connectDb) {
            await app.__test.connectDb();
        }

        // Connect to test database for direct operations
        client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        db = client.db(process.env.DB_NAME);
    });

    // Clean up before each test
    beforeEach(async () => {
        if (db) {
            await db.collection('notifications').deleteMany({});
        }
    });

    // Clean up after all tests
    afterAll(async () => {
        // Close service DB connection to avoid open handles
        if (app.__test && app.__test.closeDb) {
            await app.__test.closeDb();
        }
        if (db) {
            await db.collection('notifications').deleteMany({});
        }

        if (client) {
            await client.close();
        }

        // Clear any timers
        jest.clearAllTimers();

        // Give Node.js time to clean up
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should return healthy status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toEqual({
            status: 'healthy',
            timestamp: expect.any(String),
            database: expect.any(String),
            rabbitmq: expect.any(String)
        });
    });

    test('should return empty notifications initially', async () => {
        const response = await request(app)
            .get('/notifications')
            .expect(200);

        expect(response.body).toEqual([]);
    });

    test('should return correct notification count', async () => {
        // Add test notifications directly to database
        await db.collection('notifications').insertMany([
            { message: 'Test notification 1', timestamp: new Date().toISOString() },
            { message: 'Test notification 2', timestamp: new Date().toISOString() }
        ]);

        const response = await request(app)
            .get('/notifications/count')
            .expect(200);

        expect(response.body).toEqual({ count: 2 });
    });

    test('should retrieve all notifications', async () => {
        // Add a test notification directly to database
        const testNotification = {
            message: 'Test notification',
            timestamp: new Date().toISOString(),
            type: 'test'
        };

        await db.collection('notifications').insertOne(testNotification);

        const response = await request(app)
            .get('/notifications')
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toEqual(expect.objectContaining({
            message: 'Test notification',
            type: 'test'
        }));
    });

    test('should handle database errors gracefully', async () => {
        // Close the service DB connection to simulate an error
        await app.__test.closeDb();

        const response = await request(app)
            .get('/notifications')
            .expect(500);

        expect(response.body).toHaveProperty('error');

        // Reconnect service DB for subsequent tests
        await app.__test.connectDb();

        // Reconnect local client for test DB operations
        client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        db = client.db(process.env.DB_NAME);
    });

    test('should clear all notifications', async () => {
        // Add test notifications
        await db.collection('notifications').insertMany([
            { message: 'Test notification 1', timestamp: new Date().toISOString() },
            { message: 'Test notification 2', timestamp: new Date().toISOString() }
        ]);

        // Clear all notifications
        await request(app)
            .delete('/notifications')
            .expect(200);

        // Verify they're cleared
        const response = await request(app)
            .get('/notifications/count')
            .expect(200);

        expect(response.body).toEqual({ count: 0 });
    });
});
