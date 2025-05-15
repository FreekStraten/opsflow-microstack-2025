const { MongoClient } = require('mongodb'); ////////

async function initData() {
    const uri = process.env.MONGO_URL || 'mongodb://mijn-mongo:27017';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('Connected to MongoDB for data initialization');

        const db = client.db('myapp');
        const usersCollection = db.collection('users');

        // Check if users already exist
        const count = await usersCollection.countDocuments();
        if (count === 0) {
            // Add initial users
            const users = [
                {
                    name: "John Doe",
                    email: "john@example.com",
                    createdAt: new Date()
                },
                {
                    name: "Jane Smith",
                    email: "jane@example.com",
                    createdAt: new Date()
                },
                {
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    createdAt: new Date()
                }
            ];

            await usersCollection.insertMany(users);
            console.log('Added initial users');
        } else {
            console.log('Users already exist, skipping initialization');
        }

    } catch (error) {
        console.error('Error initializing data:', error);
    } finally {
        await client.close();
    }
}

initData();