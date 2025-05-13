const { MongoClient } = require("mongodb");

// Get environment variables
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "myapp";

console.log("=== DATABASE CONNECTION INFO ===");
console.log("MONGO_URL:", uri);
console.log("DB_NAME:", dbName);
console.log("=================================");

const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB");

        // Ensure the database exists
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));

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