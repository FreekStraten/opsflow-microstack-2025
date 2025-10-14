const { MongoClient } = require("mongodb");

// Get environment variables
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "myapp";

// Single MongoClient instance (lazy connect)
const client = new MongoClient(uri);

let isConnected = false;
let dbInstance = client.db(dbName);

async function connectToDatabase() {
    if (isConnected) {
        return dbInstance;
    }
    try {
        await client.connect();
        dbInstance = client.db(dbName);
        isConnected = true;
        console.log("MongoDB connected");
        return dbInstance;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

function getDb() {
    return dbInstance;
}

module.exports = {
    client,
    connectToDatabase,
    getDb,
    // Keep exporting a db handle for backward compatibility (lazy use)
    db: dbInstance
};
