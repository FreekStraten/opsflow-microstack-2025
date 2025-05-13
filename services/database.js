const { MongoClient } = require("mongodb");

// Haal de omgevingsvariabelen op
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "myapp";

// Log de connectie voor debugging (verwijder dit in productie)
console.log("Connecting to MongoDB at:", uri);

// Maak de MongoClient aan
const client = new MongoClient(uri);

// Functie om verbinding te maken (beter error handling)
async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB");
        return client.db(dbName);
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

// Export de client en database connectie
module.exports = {
    client: client,
    connectToDatabase: connectToDatabase,
    // Voor backwards compatibility
    db: client.db(dbName)
};