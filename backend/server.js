const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const attendanceRoutes = require("./routes/attendance");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch(err => console.log(err));
