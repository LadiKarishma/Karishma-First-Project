const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  clockIn: Date,
  clockOut: Date
});

module.exports = mongoose.model("Attendance", attendanceSchema);
