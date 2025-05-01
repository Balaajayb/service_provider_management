const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  admin_email: { type: String, required: true, unique: true },
  admin_pass: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
