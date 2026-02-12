import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Signup.css";


function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

    const signup = async () => {
      if (!name || !email || !password) {
        alert("All fields are required");
        return;
      }

      try {
        await axios.post("https://attendanceapp-bdsg.onrender.com/api/auth/signup", {
          name,
          email,
          password,
        });

        alert("Signup successful. Please login.");
        navigate("/");
      } catch (error) {
        alert(error.response?.data?.message || "Signup failed");
      }
    };

return (
  <div className="signup-container">
    <div className="signup-card">
      <h2 className="signup-card h2">Signup</h2>

      <input className="signup-card input"
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input className="signup-card input"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input className="signup-card input"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="signup-card button" onClick={signup}>Signup</button>

      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  </div>
);

}

export default Signup;