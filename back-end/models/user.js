
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  phone: String,
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpires: Date
});

const User = mongoose.model("User", userSchema);

module.exports = User;