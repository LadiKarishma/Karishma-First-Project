// import { Link } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    window.location = "/home";
  };

return (
  <div className="login-container">
    <div className="login-card">
      <h2 className="login-card h2">Login</h2>
      <input className="login-card input"
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input className="login-card input"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="login-card button" onClick={login}>Login</button>

      <p>
        Don't have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  </div>
);

}

export default Login;
