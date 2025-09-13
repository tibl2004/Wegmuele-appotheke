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
  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        'https://jugehoerig-backend.onrender.com/api/login',
        {
          benutzername: username,
          passwort: password
        }
      );

      const { token, id, userTypes, rolle, passwort_geaendert } = response.data;

      if (!passwort_geaendert) {
        // Passwort muss beim ersten Login geändert werden
        setMussPasswortAendern(true);
        setUserId(id);
        setToken(token);
      } else {
        // Normaler Login
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ userTypes, rolle, id }));
        window.location.href = '/';
      }
    } catch (error) {
      setError(
        error.response?.data?.error ||
          'Fehler beim Login. Bitte überprüfen Sie Benutzername und Passwort.'
      );
    }
  };

  // Schritt 2: Passwort ändern beim ersten Login
  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Bitte geben Sie das neue Passwort zweimal ein.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    try {
      await axios.put(
        'https://jugehoerig-backend.onrender.com/api/vorstand/change-password-erstlogin',
        { neuesPasswort: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Passwort erfolgreich geändert. Bitte loggen Sie sich erneut ein.');
      // Reset der Formularwerte
      setMussPasswortAendern(false);
      setUsername('');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError(
        error.response?.data?.error || 'Fehler beim Ändern des Passworts.'
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
