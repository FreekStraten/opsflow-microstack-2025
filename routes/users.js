var express = require('express');
var router = express.Router();
const amqp = require('amqplib');

// Haal het 'db' object uit onze database service
const { db } = require("../services/database");

// RabbitMQ connection
let channel;

async function connectRabbitMQ() {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();

    const queue = 'user_notifications';
    await channel.assertQueue(queue, { durable: true });

    console.log('API connected to RabbitMQ');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
  }
}

// Initialize RabbitMQ connection
connectRabbitMQ();

/* GET users listing. */
router.get('/', async function(req, res, next) {
  try {
    // Haal alle documenten op uit de collectie 'users'
    let users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* POST een nieuwe user */
router.post('/', async function(req, res, next){
  try {
    // Voeg een nieuw document toe aan de 'users' collectie
    const result = await db.collection('users').insertOne({
      ...req.body,
      createdAt: new Date()
    });

    const newUser = {
      id: result.insertedId,
      ...req.body
    };

    // Stuur bericht naar notification service via RabbitMQ
    if (channel) {
      const queue = 'user_notifications';
      const message = JSON.stringify(newUser);

      channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true
      });

      console.log('Notification message sent for user:', newUser.name);
    } else {
      console.warn('RabbitMQ channel not available, notification not sent');
    }

    res.status(201).json({
      "id": result.insertedId,
      "message": "User created successfully"
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

/* GET user by ID */
router.get('/:id', async function(req, res, next) {
  try {
    const { ObjectId } = require('mongodb');
    const user = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;