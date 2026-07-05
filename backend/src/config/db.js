const mongoose = require("mongoose");
const dns = require("node:dns");

// Prefer IPv4 and use Google DNS to avoid Windows DNS SRV issues
dns.setDefaultResultOrder("ipv4first");

const ATLAS_SRV_URI =
  "mongodb+srv://ahanag0000_db_user:2ir66a1WHpYrXoB6@sahayog24x7.svatvdd.mongodb.net/?appName=Sahayog24x7";

const ATLAS_DIRECT_URI =
  "mongodb://ahanag0000_db_user:2ir66a1WHpYrXoB6@ac-ezvbolv-shard-00-00.svatvdd.mongodb.net:27017,ac-ezvbolv-shard-00-01.svatvdd.mongodb.net:27017,ac-ezvbolv-shard-00-02.svatvdd.mongodb.net:27017/sahayog24x7?replicaSet=atlas-ezvbolv-shard-0&ssl=true&authSource=admin";

const connectDB = async () => {
  // Try SRV URI first, fall back to direct URI if DNS SRV fails
  const uris = process.env.MONGODB_URI
    ? [process.env.MONGODB_URI]
    : [ATLAS_SRV_URI, ATLAS_DIRECT_URI];

  for (const uri of uris) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        w: "majority",
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      const isDnsError =
        error.message?.includes("querySrv") ||
        error.message?.includes("ENOTFOUND") ||
        error.message?.includes("getaddrinfo");
      console.warn(
        `MongoDB connection via ${isDnsError ? "SRV (DNS failed)" : "direct"} URI failed: ${error.message}`
      );
    }
  }

  throw new Error(
    "Unable to connect to MongoDB. Check your Atlas URI, network connectivity, and whitelist this IP in Atlas."
  );
};

module.exports = connectDB;
