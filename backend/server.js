const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ==================
// MongoDB Connection
// ==================
connectDB();

// ==================
// Schemas & Models
// ==================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const attendanceSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    clockIn: Date,
    clockOut: Date
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
const Attendance = mongoose.model("Attendance", attendanceSchema);

// ==================
// Auth Middleware
// ==================
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "SECRET_KEY");
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ==================
// AUTH ROUTES
// ==================
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id },
    "SECRET_KEY",
    { expiresIn: "1h" }
  );

  res.json({ token });
});

// ==================
// ATTENDANCE ROUTES
// ==================
app.post("/api/attendance/clockin", auth, async (req, res) => {
  const existing = await Attendance.findOne({
    userId: req.userId,
    clockOut: null
  });

  if (existing) {
    return res.status(400).json({
      message: "Already clocked in",
      attendance: existing
    });
  }

  const attendance = await Attendance.create({
    userId: req.userId,
    clockIn: new Date(),
    clockOut: null
  });

  res.json({ message: "Clocked In", attendance });
});


app.post("/api/attendance/clockout", auth, async (req, res) => {
  const attendance = await Attendance.findOne({
    userId: req.userId,
    clockOut: null
  });

  if (!attendance) {
    return res.status(400).json({ message: "No active clock-in found" });
  }

  attendance.clockOut = new Date();
  await attendance.save();

  res.json({ message: "Clocked Out", attendance });
});


app.get("/api/attendance/status", auth, async (req, res) => {
  // Get latest attendance record
  const attendance = await Attendance.findOne({ userId: req.userId })
    .sort({ createdAt: -1 });

  if (!attendance) {
    return res.json({ status: "Not Clocked In" });
  }

  // Still clocked in
  if (!attendance.clockOut) {
    return res.json({
      status: "Clocked In",
      clockInTime: attendance.clockIn
    });
  }

  // Clocked out
  return res.json({
    status: "Clocked Out",
    clockInTime: attendance.clockIn,
    clockOutTime: attendance.clockOut
  });
});


// ==================
// Server
// ==================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

