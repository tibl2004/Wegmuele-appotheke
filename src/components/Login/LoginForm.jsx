import React, { useState } from 'react';
import axios from 'axios';
import './LoginForm.scss';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('https://jugehoerig-backend.onrender.com/api/login', {
                benutzername: username,
                passwort: password
            });

            const { token, userTypes, rolle, name } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ userTypes, rolle, name }));

            window.location.href = "/";
            console.log('Login erfolgreich:', { userTypes, rolle, name });
        } catch (error) {
            setError('Fehler beim Login. Bitte überprüfen Sie Benutzername und Passwort.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
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
        </div>
    );
};

export default LoginForm;
