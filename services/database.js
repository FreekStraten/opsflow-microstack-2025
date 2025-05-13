const { MongoClient } = require("mongodb");

// Get environment variables
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "myapp";

console.log("Connecting to MongoDB at:", uri);
console.log("Database name:", dbName);

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB");

        // Ensure the database exists by creating a test collection
        const db = client.db(dbName);
        await db.collection('_test').findOne(); // This will trigger database creation

        return db;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

module.exports = {
    client: client,
    connectToDatabase: connectToDatabase,
    db: client.db(dbName)
};