const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await Admin.findOne({ admin_email: "admin@gmail.com" });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
    } else {
      const hashedPassword = await bcrypt.hash("admin@123", 10);

      const admin = new Admin({
        admin_email: "admin@gmail.com",
        admin_pass: hashedPassword,
      });

      await admin.save();
      console.log("✅ Admin created successfully.");
    }

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
