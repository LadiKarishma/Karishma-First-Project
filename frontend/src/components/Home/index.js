import axios from "axios";
import { useEffect } from "react";
import "./Home.css";

function Home() {
  const token = localStorage.getItem("token");

  const clockIn = () => {
    axios.post(
      "http://localhost:5000/api/attendance/clockin",
      {},
      { headers: { Authorization: token } }
    );
  };

  const clockOut = () => {
    axios.post(
      "http://localhost:5000/api/attendance/clockout",
      {},
      { headers: { Authorization: token } }
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      alert("Please Clock In!");
    }, 1000 * 60 * 60);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      alert("Please Clock Out!");
    }, 1000 * 60 * 60);

    return () => clearTimeout(timer);
  }, []);

return (
  <div className="home-container">
    <div className="home-card">
      <h2 className="home-card h2">Attendance</h2>

      <button className="home-card button" onClick={clockIn}>Clock In</button>
      <button className="home-card button" onClick={clockOut}>Clock Out</button>
    </div>
  </div>
);

}

export default Home;
