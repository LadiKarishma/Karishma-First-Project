import { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";

function Home() {
  const token = localStorage.getItem("token");

  const [currentTime, setCurrentTime] = useState("");
  const [status, setStatus] = useState("Not Clocked In");
  const [clockInTime, setClockInTime] = useState("-");
  const [clockOutTime, setClockOutTime] = useState("-");

  /* ---------------- LIVE CLOCK ---------------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ---------------- REMINDERS ---------------- */
  useEffect(() => {
  // Ask notification permission
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  const scheduleReminder = (hour, minute, message) => {
    const now = new Date();
    const target = new Date();

    target.setHours(hour, minute, 0, 0);

    // If time already passed today → schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const timeout = target.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification(message);
      } else {
        alert(message); // fallback
      }
    }, timeout);
  };

  // ⏰ 9:00 AM Clock In reminder
  scheduleReminder(9, 0, "⏰ Reminder: Please Clock In");

  // ⏰ 6:00 PM Clock Out reminder
  scheduleReminder(18, 0, "⏰ Reminder: Please Clock Out");

}, []);

useEffect(() => {
  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/attendance/status",
        { headers: { Authorization: token } }
      );

      if (res.data.status === "Clocked In") {
        setStatus("Clocked In");
        setClockInTime(
          new Date(res.data.clockInTime).toLocaleTimeString()
        );
        setClockOutTime("-");
      }

      if (res.data.status === "Clocked Out") {
        setStatus("Clocked Out");
        setClockInTime(
          new Date(res.data.clockInTime).toLocaleTimeString()
        );
        setClockOutTime(
          new Date(res.data.clockOutTime).toLocaleTimeString()
        );
      }

      if (res.data.status === "Not Clocked In") {
        setStatus("Not Clocked In");
        setClockInTime("-");
        setClockOutTime("-");
      }

    } catch (err) {
      console.log("Status fetch failed");
    }
  };

  fetchStatus();
}, [token]);


  /* ---------------- CLOCK IN ---------------- */
const clockIn = async () => {
  if (status === "Clocked In") {
    alert("You are already clocked in");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/attendance/clockin",
      {},
      { headers: { Authorization: token } }
    );

    const time = new Date(res.data.attendance.clockIn).toLocaleTimeString();
    setClockInTime(time);
    setStatus("Clocked In");

    alert(`Clocked In at ${time}`);
  } catch (err) {
    alert(err.response?.data?.message || "Clock In failed");
  }
};


  /* ---------------- CLOCK OUT ---------------- */
const clockOut = async () => {
  if (status !== "Clocked In") {
    alert("You are not clocked in");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/api/attendance/clockout",
      {},
      { headers: { Authorization: token } }
    );

    const time = new Date(res.data.attendance.clockOut).toLocaleTimeString();
    setClockOutTime(time);
    setStatus("Clocked Out");

    alert(`Clocked Out at ${time}`);
  } catch (err) {
    alert("Clock Out failed");
  }
};


  const logout = () => {
    localStorage.removeItem("token");
    window.location = "/";
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h2>Attendance Dashboard</h2>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Cards */}
      <div className="dashboard-cards">
        <div className="card">
          <h3>Current Time</h3>
          <p>{currentTime}</p>
        </div>

        <div className="card">
          <h3>Status</h3>
          <p>{status}</p>
        </div>

        <div className="card">
          <h3>Clock In Time</h3>
          <p>{clockInTime}</p>
        </div>

        <div className="card">
          <h3>Clock Out Time</h3>
          <p>{clockOutTime}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="action-buttons">
        <button className="clockin-btn" onClick={clockIn}>
          Clock In
        </button>
        <button className="clockout-btn" onClick={clockOut}>
          Clock Out
        </button>
      </div>
    </div>
  );
}

export default Home;