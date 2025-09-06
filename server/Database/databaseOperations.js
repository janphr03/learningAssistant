import { MongoClient, ObjectId } from "mongodb";
import "dotenv/config";

const MONGO_DB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "Themengebiete";

class DatabaseManager {

    // legt Startbedingungen fest
    constructor() {
        this.client = null;
        this.db = null;
        this.connected = false;
    }

    async connect() {
        if (!this.connected) {
            this.client = new MongoClient(MONGO_DB_URI);
            await this.client.connect();
            this.db = this.client.db(DB_NAME);
            this.connected = true;
            console.log("MongoDB connected");
        }
        return this.db;
    }

    async getDb() {
        return await this.connect();
    }


    async close() {
        if (this.client && this.connected) {
            await this.client.close();
            this.connected = false;
            console.log("MongoDB Verbindung geschlossen");
        }
    }

    // Generische Methoden
    async insertDocument(collection, document) {
        const db = await this.getDb();
        const result = await db.collection(collection).insertOne({
            ...document,
            createdAt: new Date()
        });
        return { id: result.insertedId, ...document };
    }

    async getAllDocuments(collection, sortField = "createdAt", sortOrder = -1) {
        const db = await this.getDb();
        return await db.collection(collection).find().sort({ [sortField]: sortOrder }).toArray();
    }

    async getDocumentById(collection, id) {
        const db = await this.getDb();
        return await db.collection(collection).findOne({ _id: new ObjectId(id) });
    }


    async deleteDocument(collection, id) {
        const db = await this.getDb();
        const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    }
}

// Singleton-Instanz exportieren
const dbManager = new DatabaseManager();
export default dbManager;