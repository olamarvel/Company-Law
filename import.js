const { MongoClient } = require('mongodb');
const fs = require('fs');

// Replace with your actual MongoDB connection string
const uri = "mongodb://admin:secret@localhost:27017/?authSource=admin"; 

async function importLaws() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("N8N"); // Make sure this matches your DB name
        const collection = db.collection("cama_laws");

        console.log("Clearing out old/bad data...");
        // This deletes the old short-sentence data so you don't have duplicates
        await collection.deleteMany({}); 

        console.log("Reading the new JSON file...");
        const rawData = fs.readFileSync('all_cama_laws.json');
        const laws = JSON.parse(rawData);

        console.log("Inserting new laws into MongoDB...");
        const result = await collection.insertMany(laws);
        
        console.log(`Success! ${result.insertedCount} clean laws are now in your database.`);
        
    } catch (error) {
        console.error("Error importing data:", error);
    } finally {
        await client.close();
    }
}

importLaws();