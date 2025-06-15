// notification-service/index.js
const express = require('express');
const amqp = require('amqplib');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Database setup
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'notifications';
const client = new MongoClient(mongoUrl);
let db;

// Email setup (mock transporter voor development)
// FIX: createTransport (zonder 's')
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
    }
});

// Connect to databases and RabbitMQ
async function connectToServices() {
    try {
        // Connect to MongoDB
        await client.connect();
        db = client.db(dbName);
        console.log('Connected to notification database');

        // Connect to RabbitMQ with retry logic
        await connectToRabbitMQ();

    } catch (error) {
        console.error('Failed to connect to services:', error);
        process.exit(1);
    }
}

async function connectToRabbitMQ() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    let retries = 5;

    while (retries > 0) {
        try {
            console.log(`Attempting to connect to RabbitMQ... (${6 - retries}/5)`);

            const connection = await amqp.connect(rabbitmqUrl);
            const channel = await connection.createChannel();

            const queue = 'user_notifications';
            await channel.assertQueue(queue, { durable: true });

            console.log('Connected to RabbitMQ, waiting for messages...');

            // Listen for messages
            channel.consume(queue, async (msg) => {
                if (msg) {
                    try {
                        const userData = JSON.parse(msg.content.toString());
                        await processUserNotification(userData);
                        channel.ack(msg);
                        console.log('Message processed successfully');
                    } catch (error) {
                        console.error('Error processing message:', error);
                        channel.nack(msg, false, false);
                    }
                }
            });

            break; // Exit retry loop on success

        } catch (error) {
            retries--;
            console.error(`RabbitMQ connection failed: ${error.message}`);

            if (retries === 0) {
                console.error('Failed to connect to RabbitMQ after 5 attempts');
                throw error;
            }

            console.log(`Retrying in 5 seconds... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Process user notification
async function processUserNotification(userData) {
    try {
        console.log('Processing notification for user:', userData);

        // Save notification to database
        const notification = {
            userId: userData.id,
            userEmail: userData.email,
            userName: userData.name,
            message: `Welcome ${userData.name}! Your account has been created.`,
            status: 'sent',
            createdAt: new Date()
        };

        await db.collection('notifications').insertOne(notification);
        console.log('Notification saved to database');

        // For development, just log the email instead of sending
        const mailOptions = {
            from: 'noreply@devops-app.com',
            to: userData.email,
            subject: 'Welcome to our DevOps App!',
            html: `
                <h2>Welcome ${userData.name}!</h2>
                <p>Your account has been successfully created.</p>
                <p>Email: ${userData.email}</p>
                <p>Thank you for joining us!</p>
            `
        };

        console.log('📧 Email would be sent:', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            message: `Welcome ${userData.name}!`
        });

        // Uncomment for actual email sending in production:
        // await transporter.sendMail(mailOptions);

        console.log('✅ Notification processed successfully');

    } catch (error) {
        console.error('❌ Error processing notification:', error);
        throw error;
    }
}

// API Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notification-service',
        timestamp: new Date().toISOString()
    });
});

app.get('/notifications', async (req, res) => {
    try {
        const notifications = await db.collection('notifications').find().toArray();
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/notifications/count', async (req, res) => {
    try {
        const count = await db.collection('notifications').countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error counting notifications:', error);
        res.status(500).json({ error: error.message });
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await client.close();
    process.exit(0);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Notification service running on port ${PORT}`);
});

// Initialize
connectToServices();