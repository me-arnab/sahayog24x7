require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const connectDB = require("./src/config/db");

const seedAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@sahayog24x7.com";
    const password = "AdminPassword123!";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin user already exists. Updating password...");
      existingAdmin.password = await bcrypt.hash(password, 10);
      await existingAdmin.save();
      console.log("Admin password updated!");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        name: "Super Admin",
        email: email,
        phone: "9999999999",
        consumerId: "ADMIN-001",
        password: hashedPassword,
        role: "admin",
      });
      console.log("Admin user created successfully!");
    }

    console.log("-----------------------------------------");
    console.log("Admin Credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
