// dbOperation.js
import { MongoClient } from "mongodb";

const uri = "mongodb://hrjlhy:19940823@34.212.130.14:27017/WhoIsTheAI?authSource=admin";
const client = new MongoClient(uri);

export async function saveGameStats(stats) {
  try {
    await client.connect();
    const db = client.db("WhoIsTheAI");
    const collection = db.collection("gameStats");

    const aiWinRate = stats.totalGames > 0
      ? stats.aiWins / stats.totalGames
      : 0;

    const record = {
      totalGames: stats.totalGames,
      totalGameTime: stats.totalGameTime,
      humanWins: stats.humanWins,
      aiWins: stats.aiWins,
      aiWinRate,
      createdAt: new Date(),
    };

    await collection.insertOne(record);
    console.log("📁 Saved to DB:", record);
  } catch (error) {
    console.error("❌ MongoDB save error:", error);
  } finally {
    await client.close();
  }
}