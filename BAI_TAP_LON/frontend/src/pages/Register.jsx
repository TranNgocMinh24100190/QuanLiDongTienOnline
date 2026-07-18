import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/register", {
        full_name: username,
        email,
        password
      },
      {
        withCredentials: true
      }
    );
      setMessage("Đăng ký thành công! Bạn có thể đăng nhập.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage("Có lỗi xảy ra khi đăng ký.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Đăng ký tài khoản</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <button type="submit">Đăng ký</button>
      </form>
      {message && (
        <p className="auth-message">{message}</p>
      )}
      <p className="auth-switch">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
}

export default Register;

