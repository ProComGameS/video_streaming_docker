
import 'dotenv/config';
import MongoClient from 'mongodb';

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${dbUser}:${dbPassword}@test.xm463mn.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

let db;
let usersCollection;
let videoCollection;

async function connectDB() {
    await client.connect();
    db = client.db("Test");
    usersCollection = db.collection("users");
    videoCollection = db.collection("videos");
    console.log("✅ DB connected");
}

function getDB() {
    return { db, usersCollection, videoCollection };
}

module.exports = { connectDB, getDB };
