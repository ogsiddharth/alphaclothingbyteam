const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection (local)
mongoose.connect("mongodb://127.0.0.1:27017/authApp")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", UserSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ message: "All fields are required!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "Signup successful!" });
  } catch (err) {
    res.json({ message: "User already exists!" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User not registered. Please signup." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    res.json({ message: `Login successful! Welcome ${user.name}` });
  } else {
    res.json({ message: "Wrong password!" });
  }
});

// Server start
app.listen(5000, () => console.log("🚀 Server running on port 5000"));