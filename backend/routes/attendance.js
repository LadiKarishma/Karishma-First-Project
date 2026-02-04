// routes/attendance.js
const router = require("express").Router();
const Attendance = require("../models/Attendance");
const auth = require("../middleware/authMiddleware");

router.post("/clockin", auth, async (req, res) => {
  const attendance = new Attendance({
    userId: req.userId,
    clockIn: new Date()
  });
  await attendance.save();
  res.json("Clocked In");
});

router.post("/clockout", auth, async (req, res) => {
  await Attendance.findOneAndUpdate(
    { userId: req.userId, clockOut: null },
    { clockOut: new Date() }
  );
  res.json("Clocked Out");
});

module.exports = router;
