import React, { useState } from 'react';
import { FaUserAlt, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import './LoginForm.scss';

const LoginForm = () => {
  const [benutzername, setBenutzername] = useState('');
  const [passwort, setPasswort] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://shelf-life-331c.onrender.com/api/login', {
        benutzername,
        passwort,
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        
        // Weiterleitung zur Startseite nach erfolgreichem Login
        window.location.href = "/";
        
        // Optional kannst du den userType weiterverarbeiten
        const { userType } = response.data;
        console.log('Login erfolgreich, User Type:', userType);
      } else {
        setError('Unbekannter Fehler. Bitte versuche es später erneut.');
      }
    } catch (err) {
      if (err.response) {
        console.error('API Antwort: ', err.response.data);
        setError(err.response.data.error || 'Fehler beim Login.');
      } else {
        console.error('Netzwerkfehler: ', err);
        setError('Es gab ein Problem mit dem Server. Bitte versuche es später erneut.');
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2><FaSignInAlt /> Jugehörig Login</h2>

        <div className="input-group">
          <FaUserAlt className="icon" />
          <input
            type="text"
            placeholder="Benutzername"
            value={benutzername}
            onChange={(e) => setBenutzername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <FaLock className="icon" />
          <input
            type="password"
            placeholder="Passwort"
            value={passwort}
            onChange={(e) => setPasswort(e.target.value)}
            required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="login-button">
          <FaSignInAlt className="btn-icon" /> Einloggen
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
