// ESM
import "dotenv/config";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;                    // in .env
const dbName = process.env.DB_NAME || "Themengebiete";  // oder dein Name

let client, db;
export async function getDb() {
    if (!client) {
        client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 10 });
        await client.connect();
        db = client.db(dbName);
    }
    return db;
}

export async function closeDb() {
    if (client) { await client.close(); client = null; db = null; }
}
