process.env.JWT_SECRET = "test";
process.env.MONGODB_URI = "mongodb+srv://arnabme2005_db_user:Qlaf2UNT6RQ2iKBy@complains.quakjti.mongodb.net/?appName=Complains";

console.log("Loading app module...");
require("./src/app");
console.log("SUCCESS: All modules loaded without errors");
