import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.scss';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mussPasswortAendern, setMussPasswortAendern] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState('');

// Schritt 1: Login
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await axios.post(
      "https://wegm-hle-apotheke-backend.onrender.com/api/login",
      {
        username,
        password,
      }
    );

    const { token, id, userTypes, mustChangePassword } = res.data;

    if (mustChangePassword) {
      setMussPasswortAendern(true);
      setToken(token);
    } else {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, userTypes }));
      window.location.href = "/";
    }
  } catch (err) {
    setError(
      err.response?.data?.error ||
        "Login fehlgeschlagen."
    );
  }
};

// Schritt 2: Passwort ändern beim ersten Login
const handleChangePassword = async (e) => {
  e.preventDefault();
  setError("");

  if (newPassword !== confirmPassword) {
    setError("Passwörter stimmen nicht überein.");
    return;
  }

  try {
    await axios.post(
      "https://wegm-hle-apotheke-backend.onrender.com/api/login/change-password",
      { newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Passwort geändert. Bitte erneut einloggen.");
    window.location.href = "/login";
  } catch (err) {
    setError(
      err.response?.data?.error ||
        "Passwortänderung fehlgeschlagen."
    );
  }
};


  return (
    <div className="login-container">
      {!mussPasswortAendern ? (
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Login</h2>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Benutzername</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">Passwort</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Login</button>
        </form>
      ) : (
        <form className="login-form" onSubmit={handleChangePassword}>
          <h2 className="login-title">Passwort ändern</h2>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">Neues Passwort</label>
            <input
              type="password"
              id="newPassword"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Passwort wiederholen</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Passwort ändern</button>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
