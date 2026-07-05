process.env.JWT_SECRET = "test";
process.env.MONGODB_URI = "mongodb+srv://ahanag0000_db_user:2ir66a1WHpYrXoB6@sahayog24x7.svatvdd.mongodb.net/?appName=Sahayog24x7";

console.log("Loading app module...");
require("./src/app");
console.log("SUCCESS: All modules loaded without errors");
