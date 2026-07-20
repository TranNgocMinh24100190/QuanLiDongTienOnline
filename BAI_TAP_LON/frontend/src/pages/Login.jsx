import React, { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../api/auth";
import "../styles/Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({
        email,
        password,
      });

      localStorage.setItem("role", res.data.role);
      
      setMessage("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setMessage("Sai tài khoản hoặc mật khẩu.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Đăng nhập</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>
      {message && <p className="auth-message">{message}</p>}
      <p className="auth-switch">
        Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </div>
  );
}

export default Login;
