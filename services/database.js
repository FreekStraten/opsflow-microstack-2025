const { MongoClient } = require("mongodb");

// Haal de omgevingsvariabelen op, met een default voor DB_NAME
const uri = process.env.MONGO_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "default_db_name";

// Maak de MongoClient aan en selecteer de database
const client = new MongoClient(uri);
const db = client.db(dbName);

module.exports = {
    db: db,
    client: client
};