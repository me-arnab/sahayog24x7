const mongoose = require("mongoose");
const dns = require("node:dns");

const atlasUri = process.env.MONGODB_URI;
const directHostUri = "mongodb://ahanag0000_db_user:2ir66a1WHpYrXoB6@ac-ezvbolv-shard-00-00.svatvdd.mongodb.net:27017,ac-ezvbolv-shard-00-01.svatvdd.mongodb.net:27017,ac-ezvbolv-shard-00-02.svatvdd.mongodb.net:27017/sahayog24x7?replicaSet=atlas-ezvbolv-shard-0&ssl=true&authSource=admin";

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  const candidateUris = [directHostUri, atlasUri].filter(Boolean);

  for (const uri of candidateUris) {
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
      console.warn(`MongoDB connection attempt failed for ${uri}: ${error.message}`);
    }
  }

  throw new Error(`Unable to connect to MongoDB using configured URI(s): ${candidateUris.join(" | ")}`);
};

module.exports = connectDB;
