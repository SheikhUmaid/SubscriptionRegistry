import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../models/Admin.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/zinth_registry";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB at:", MONGO_URI);

    // Parse command line arguments: node createAdmin.js <email> <password> <name>
    const args = process.argv.slice(2);
    const email = (args[0] || process.env.ADMIN_EMAIL || "admin@zinthlabs.com").toLowerCase().trim();
    const password = args[1] || process.env.ADMIN_PASSWORD || "Admin@123456";
    const name = args[2] || process.env.ADMIN_NAME || "Master Admin";

    if (!email || !password || !name) {
      console.error("Usage: node createAdmin.js <email> <password> <name>");
      process.exit(1);
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let admin = await Admin.findOne({ email });

    if (admin) {
      admin.name = name;
      admin.password = hashedPassword;
      await admin.save();
      console.log("\n Existing admin user updated successfully!");
    } else {
      admin = await Admin.create({
        name,
        email,
        password: hashedPassword,
      });
      console.log("\n New admin user created successfully!");
    }

    console.log("-----------------------------------------");
    console.log(`ID:       ${admin._id}`);
    console.log(`Name:     ${admin.name}`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");
    console.log("You can now sign in at the frontend login page.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

createAdmin();

