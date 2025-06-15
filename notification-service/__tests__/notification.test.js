const request = require('supertest');
const { MongoClient } = require('mongodb');

// Mock the app setup
const app = require('../index');

// Database connection for testing
let client;
let db;

describe('Notification Service', () => {
    beforeAll(async () => {
        // Connect to test database
        const uri = process.env.MONGO_URL || 'mongodb://localhost:27017';
        client = new MongoClient(uri);
        await client.connect();
        db = client.db('notifications_test');

        // Clear test data
        await db.collection('notifications').deleteMany({});
    });

    afterAll(async () => {
        if (client) {
            await client.close();
        }
    });

    beforeEach(async () => {
        // Clear notifications before each test
        await db.collection('notifications').deleteMany({});
    });

    test('should return healthy status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);

        expect(response.body).toEqual({
            status: 'healthy',
            service: 'notification-service'
        });
    });

    test('should return empty notifications initially', async () => {
        const response = await request(app)
            .get('/notifications')
            .expect(200);

        expect(response.body).toEqual([]);
    });

    test('should return correct notification count', async () => {
        // Add test notifications
        await db.collection('notifications').insertMany([
            {
                userId: 'test1',
                userEmail: 'test1@example.com',
                userName: 'Test User 1',
                message: 'Test message 1',
                status: 'sent',
                createdAt: new Date()
            },
            {
                userId: 'test2',
                userEmail: 'test2@example.com',
                userName: 'Test User 2',
                message: 'Test message 2',
                status: 'sent',
                createdAt: new Date()
            }
        ]);

        const response = await request(app)
            .get('/notifications/count')
            .expect(200);

        expect(response.body).toEqual({ count: 2 });
    });

    test('should retrieve all notifications', async () => {
        // Add test notification
        const testNotification = {
            userId: 'test123',
            userEmail: 'test@example.com',
            userName: 'Test User',
            message: 'Welcome Test User! Your account has been created.',
            status: 'sent',
            createdAt: new Date()
        };

        await db.collection('notifications').insertOne(testNotification);

        const response = await request(app)
            .get('/notifications')
            .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0]).toMatchObject({
            userId: 'test123',
            userEmail: 'test@example.com',
            userName: 'Test User',
            message: 'Welcome Test User! Your account has been created.',
            status: 'sent'
        });
    });

    test('should handle database errors gracefully', async () => {
        // Mock database error by closing connection temporarily
        await client.close();

        const response = await request(app)
            .get('/notifications')
            .expect(500);

        expect(response.body).toHaveProperty('error');

        // Reconnect for cleanup
        client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017');
        await client.connect();
        db = client.db('notifications_test');
    });
});