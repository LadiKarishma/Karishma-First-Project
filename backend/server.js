const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const connectDB = require("./db");
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

// ==================
// Schemas & Models
// ==================

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  clockIn: Date,
  clockOut: Date,
});

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
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hashedPassword });
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Email already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, "SECRET_KEY", {
    expiresIn: "1h",
  });

  res.json({ token });
});

// ==================
// ATTENDANCE ROUTES
// ==================

app.post("/api/attendance/clockin", auth, async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if already clocked in today
    const existing = await Attendance.findOne({
      userId: req.userId,
      clockIn: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already clocked in today"
      });
    }

    const attendance = await Attendance.create({
      userId: req.userId,
      clockIn: now,
      clockOut: null
    });

    res.json({
      message: "Clocked In",
      attendance
    });

  } catch (error) {
    res.status(500).json({ message: "Clock In failed" });
  }
});

app.post("/api/attendance/clockout", auth, async (req, res) => {
  try {
    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      userId: req.userId,
      clockIn: { $gte: startOfDay, $lte: endOfDay },
      clockOut: null
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No active clock-in found for today"
      });
    }

    attendance.clockOut = now;
    await attendance.save();

    res.json({
      message: "Clocked Out",
      attendance
    });

  } catch (error) {
    res.status(500).json({ message: "Clock Out failed" });
  }
});

app.get("/api/attendance/status", auth, async (req, res) => {
  try {
    const now = new Date();

    // Convert to IST manually (important)
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + IST_OFFSET);

    const startOfDay = new Date(istNow);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(istNow);
    endOfDay.setHours(23, 59, 59, 999);

    // Convert back to UTC for MongoDB comparison
    const startUTC = new Date(startOfDay.getTime() - IST_OFFSET);
    const endUTC = new Date(endOfDay.getTime() - IST_OFFSET);

    const attendance = await Attendance.findOne({
      userId: req.userId,
      clockIn: { $gte: startUTC, $lte: endUTC },
    });

    if (!attendance) {
      return res.json({
        status: "Not Clocked In",
        clockInTime: null,
        clockOutTime: null,
      });
    }

    if (!attendance.clockOut) {
      return res.json({
        status: "Clocked In",
        clockInTime: attendance.clockIn,
        clockOutTime: null,
      });
    }

    return res.json({
      status: "Clocked Out",
      clockInTime: attendance.clockIn,
      clockOutTime: attendance.clockOut,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ==================
// Server
// ==================

app.listen(PORT, () => {
  console.log("Server running on port 5000");
});