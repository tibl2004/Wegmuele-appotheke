import React, { useState } from 'react';
import axios from 'axios';
import './VorstandForm.scss';

export default function VorstandForm() {
  const [formData, setFormData] = useState({
    geschlecht: '',
    vorname: '',
    nachname: '',
    adresse: '',
    plz: '',
    ort: '',
    benutzername: '',
    passwort: '',
    telefon: '',
    email: '',
    foto: '',
    beschreibung: '',
    rolle: ''
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🔹 Eingaben ändern
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Foto laden & Base64 umwandeln
  const handleFotoChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Nur PNG, JPG oder WEBP erlaubt.');
      setFotoPreview(null);
      setFormData(prev => ({ ...prev, foto: '' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, foto: reader.result }));
      setFotoPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Formular senden
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Pflichtfelder prüfen
    const requiredFields = [
      'geschlecht',
      'vorname',
      'nachname',
      'adresse',
      'plz',
      'ort',
      'benutzername',
      'passwort',
      'telefon',
      'email',
      'rolle'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError('Bitte alle Pflichtfelder ausfüllen.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token'); // 🔐 Auth-Token
      const res = await axios.post('https://jugehoerig-backend.onrender.com/api/vorstand', formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      setSuccessMsg(res.data.message || 'Vorstand erfolgreich erstellt!');
      setFormData({
        geschlecht: '',
        vorname: '',
        nachname: '',
        adresse: '',
        plz: '',
        ort: '',
        benutzername: '',
        passwort: '',
        telefon: '',
        email: '',
        foto: '',
        beschreibung: '',
        rolle: ''
      });
      setFotoPreview(null);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Fehler beim Erstellen des Vorstands.');
      }
    }
  };

  return (
    <form className="vorstand-form" onSubmit={handleSubmit}>
      {fotoPreview && (
        <img src={fotoPreview} alt="Foto Vorschau" className="foto-preview" />
      )}

      <div className="form-content">
        {error && <p className="error-message">{error}</p>}
        {successMsg && <p className="success-message">{successMsg}</p>}

        <div className="form-row">
          <label>Geschlecht*</label>
          <select
            name="geschlecht"
            value={formData.geschlecht}
            onChange={handleChange}
            required
          >
            <option value="">Bitte wählen</option>
            <option value="Weiblich">Weiblich</option>
            <option value="Männlich">Männlich</option>
            <option value="Divers">Divers</option>
          </select>
        </div>

        <div className="form-row two-columns">
          <div>
            <label>Vorname*</label>
            <input
              type="text"
              name="vorname"
              value={formData.vorname}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Nachname*</label>
            <input
              type="text"
              name="nachname"
              value={formData.nachname}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>Adresse*</label>
        <input
          type="text"
          name="adresse"
          value={formData.adresse}
          onChange={handleChange}
          required
        />

        <div className="form-row two-columns">
          <div>
            <label>PLZ*</label>
            <input
              type="text"
              name="plz"
              value={formData.plz}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Ort*</label>
            <input
              type="text"
              name="ort"
              value={formData.ort}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <label>Benutzername*</label>
        <input
          type="text"
          name="benutzername"
          value={formData.benutzername}
          onChange={handleChange}
          required
        />

        <label>Passwort*</label>
        <input
          type="password"
          name="passwort"
          value={formData.passwort}
          onChange={handleChange}
          required
        />

        <label>Telefon*</label>
        <input
          type="tel"
          name="telefon"
          value={formData.telefon}
          onChange={handleChange}
          required
        />

        <label>Email*</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Foto (PNG, JPG oder WEBP)</label>
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFotoChange}
        />

        <label>Beschreibung</label>
        <textarea
          name="beschreibung"
          value={formData.beschreibung}
          onChange={handleChange}
          rows="3"
        />

        <label>Rolle*</label>
        <select
          name="rolle"
          value={formData.rolle}
          onChange={handleChange}
          required
        >
          <option value="">Bitte wählen</option>
          <option value="Vorstandsmitglied">Vorstandsmitglied</option>
          <option value="Mitglied">Mitglied</option>
        </select>

        <button type="submit">Vorstand erstellen</button>
      </div>
    </form>
  );
}
