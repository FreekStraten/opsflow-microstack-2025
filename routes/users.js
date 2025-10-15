var express = require('express');
var router = express.Router();
const { db } = require('../services/database');
const amqp = require('amqplib');

// Check if we're in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

let channel = null;

// Initialize RabbitMQ connection with proper test environment handling
async function connectToRabbitMQ() {
  if (isTestEnvironment) {
    console.log('Test environment detected, skipping RabbitMQ connection');
    return null;
  }

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();

    // Declare the queue
    await channel.assertQueue('notifications', { durable: true });

    console.log('API connected to RabbitMQ');
    return channel;
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);

    // In test environment, continue without RabbitMQ
    if (isTestEnvironment) {
      console.log('Continuing without RabbitMQ in test environment');
      return null;
    }

    // In production, you might want to retry or handle this differently
    throw error;
  }
}

// Initialize RabbitMQ connection on startup (but not in tests)
if (!isTestEnvironment) {
  connectToRabbitMQ().catch(console.error);
}

// Helper function to send notification (with fallback for tests)
async function sendNotification(message) {
  if (isTestEnvironment || !channel) {
    console.log('Notification would be sent (test mode):', message);
    return;
  }

  try {
    const notification = {
      id: Date.now().toString(),
      message: message,
      timestamp: new Date().toISOString(),
      type: 'user_action'
    };

    channel.sendToQueue('notifications', Buffer.from(JSON.stringify(notification)));
    console.log('Notification sent to queue:', notification);
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/* GET users listing. */
router.get('/', async function(req, res) {
  try {
    // Get all users from database
    const users = await db.collection('users').find({}).toArray();

    // Send notification about users being retrieved
    await sendNotification(`Retrieved ${users.length} users`);

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

/* POST new user */
router.post('/', async function(req, res) {
  try {
    const userData = req.body;

    // Insert user into database
    const result = await db.collection('users').insertOne(userData);

    // Send notification about new user
    await sendNotification(`New user created: ${userData.name || 'Unknown'}`);

    res.status(201).json({
      message: 'User created successfully',
      id: result.insertedId
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
