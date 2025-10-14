const express = require('express');
const { MongoClient } = require('mongodb');
const amqp = require('amqplib');

const app = express();

// Check if we're in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Middleware
app.use(express.json());

// Database configuration
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'notifications';

let db = null;
let client = null;
let channel = null;

// Ensure DB connection is available (used in tests and lazy paths)
async function ensureDb() {
    if (!db) {
        // In test environment, do not auto-reconnect so tests can simulate failures
        if (isTestEnvironment) {
            return null;
        }
        await connectToDatabase();
    }
    return db;
}

// Connect to MongoDB
async function connectToDatabase() {
    const maxRetries = isTestEnvironment ? 1 : 10;
    const delayMs = 3000;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            client = new MongoClient(MONGO_URL);
            await client.connect();
            db = client.db(DB_NAME);
            console.log('Connected to notification database');
            return db;
        } catch (error) {
            attempt++;
            console.error(`Failed to connect to database (attempt ${attempt}/${maxRetries}):`, error.message || error);
            if (attempt >= maxRetries || isTestEnvironment) {
                throw error;
            }
            await new Promise(r => setTimeout(r, delayMs));
        }
    }
}

// Connect to RabbitMQ with retry logic and test environment handling
async function connectToRabbitMQ() {
    if (isTestEnvironment) {
        console.log('Test environment detected, skipping RabbitMQ connection');
        return null;
    }

    let retries = 5;

    while (retries > 0) {
        try {
            console.log(`Attempting to connect to RabbitMQ... (${6-retries}/5)`);

            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            channel = await connection.createChannel();

            // Declare the queue
            await channel.assertQueue('notifications', { durable: true });

            console.log('Notification service connected to RabbitMQ');

            // Start consuming messages
            startMessageConsumer();

            return channel;
        } catch (error) {
            retries--;
            console.error(`RabbitMQ connection failed: ${error.message}`);

            if (retries === 0) {
                console.error('Failed to connect to RabbitMQ after 5 attempts');
                if (!isTestEnvironment) {
                    throw error;
                }
            } else {
                console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    return null;
}

// Start consuming messages from RabbitMQ
function startMessageConsumer() {
    if (!channel || isTestEnvironment) {
        return;
    }

    channel.consume('notifications', async (message) => {
        if (message) {
            try {
                const notification = JSON.parse(message.content.toString());

                // Store notification in database
                await db.collection('notifications').insertOne({
                    ...notification,
                    receivedAt: new Date()
                });

                console.log('Notification stored:', notification);

                // Acknowledge the message
                channel.ack(message);
            } catch (error) {
                console.error('Error processing notification:', error);
                // Reject the message (requeue)
                channel.nack(message, false, true);
            }
        }
    });
}

// Initialize all connections
async function connectToServices() {
    try {
        await connectToDatabase();

        if (!isTestEnvironment) {
            await connectToRabbitMQ();
        }
    } catch (error) {
        console.error('Failed to initialize services:', error);
        if (!isTestEnvironment) {
            process.exit(1);
        }
    }
}

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: db ? 'connected' : 'disconnected',
        rabbitmq: channel ? 'connected' : 'disconnected'
    });
});

app.get('/notifications', async (req, res) => {
    try {
        const database = await ensureDb();
        const notifications = await database.collection('notifications').find({}).toArray();
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.get('/notifications/count', async (req, res) => {
    try {
        const database = await ensureDb();
        const count = await database.collection('notifications').countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error counting notifications:', error);
        res.status(500).json({ error: 'Failed to count notifications' });
    }
});

app.delete('/notifications', async (req, res) => {
    try {
        const database = await ensureDb();
        await database.collection('notifications').deleteMany({});
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// Export the app for testing
module.exports = app;

// Only start the server if this file is run directly (not imported by tests)
if (require.main === module) {
    const PORT = process.env.PORT || 3001;

    // Initialize services and start server
    connectToServices().then(() => {
        app.listen(PORT, () => {
            console.log(`Notification service running on port ${PORT}`);
        });
    }).catch((error) => {
        console.error('Failed to start notification service:', error);
        process.exit(1);
    });
}

// In test environment, proactively connect to the database (skip RabbitMQ)
if (isTestEnvironment) {
    connectToDatabase().catch((err) => {
        console.error('Test DB connection failed:', err);
    });
}

// Expose minimal test helpers
if (isTestEnvironment) {
    app.__test = {
        closeDb: async () => {
            try {
                if (client) {
                    await client.close();
                }
            } catch (e) {
                // ignore
            } finally {
                db = null;
                client = null;
            }
        },
        connectDb: async () => {
            await connectToDatabase();
        }
    };
}
