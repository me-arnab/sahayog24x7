const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

async function test() {
  console.log("Testing MongoDB connection...");
  console.log("URI loaded from .env:", uri ? "YES (hidden for security)" : "NO");

  try {
    console.log("URI:", uri);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✅ MongoDB Connected!");
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.db.databaseName);

    // Quick test — list collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(", ") || "(empty)");

    await conn.connection.close();
    console.log("✅ Connection closed.");
  } catch (err) {
    console.log("❌ Connection failed");
    console.log("Error name:", err.name);
    console.log("Error message:", err.message);
    if (err.cause) console.log("Cause:", err.cause);

    if (err.message && err.message.includes("querySrv")) {
      console.log("\n🔍 This is a DNS SRV lookup failure. Possible causes:");
      console.log("  1. The cluster hostname 'sahayog24x7.svatvdd.mongodb.net' doesn't exist");
      console.log("  2. Network/firewall blocking DNS queries to MongoDB Atlas");
      console.log("  3. No internet access from this machine");
      console.log("\n💡 Try using a direct connection string (non-SRV) from MongoDB Atlas instead.");
    }
  }
  process.exit(0);
}

test();
