import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EventForm.scss';

export default function EventForm({ eventId = null, onSuccess }) {
  const [formData, setFormData] = useState({
    titel: '',
    beschreibung: '',
    ort: '',
    von: '',
    bis: '',
    alle: false,
    supporter: false,
    bild: ''
  });

  const [bildPreview, setBildPreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Falls eventId gesetzt ist, Daten zum Editieren laden
  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    axios.get(`/api/events/${eventId}`)
      .then(({ data }) => {
        setFormData({
          titel: data.titel || '',
          beschreibung: data.beschreibung || '',
          ort: data.ort || '',
          von: data.von ? data.von.substring(0,16) : '',
          bis: data.bis ? data.bis.substring(0,16) : '',
          alle: data.alle || false,
          supporter: data.supporter || false,
          bild: data.bild || ''
        });
        setBildPreview(data.bild || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Fehler beim Laden des Events.');
        setLoading(false);
      });
  }, [eventId]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBildChange = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      setError('Nur PNG-Bilder sind erlaubt.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, bild: reader.result }));
      setBildPreview(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const requiredFields = ['titel', 'beschreibung', 'ort', 'von', 'bis'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setError('Bitte alle Pflichtfelder ausfüllen.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!validate()) return;

    setLoading(true);
    try {
      if (eventId) {
        await axios.put(`/api/events/${eventId}`, formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccessMsg('Event erfolgreich aktualisiert.');
      } else {
        await axios.post('/api/events', formData, {
          headers: { 'Content-Type': 'application/json' }
        });
        setSuccessMsg('Event erfolgreich erstellt.');
        setFormData({
          titel: '',
          beschreibung: '',
          ort: '',
          von: '',
          bis: '',
          alle: false,
          supporter: false,
          bild: ''
        });
        setBildPreview(null);
      }
      if(onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Fehler beim Speichern des Events.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form" noValidate>
      <h2>{eventId ? 'Event bearbeiten' : 'Neues Event erstellen'}</h2>

      {error && <p className="error-message">{error}</p>}
      {successMsg && <p className="success-message">{successMsg}</p>}

      <label htmlFor="titel">Titel *</label>
      <input
        id="titel"
        name="titel"
        type="text"
        value={formData.titel}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <label htmlFor="beschreibung">Beschreibung *</label>
      <textarea
        id="beschreibung"
        name="beschreibung"
        value={formData.beschreibung}
        onChange={handleChange}
        rows={4}
        required
        disabled={loading}
      />

      <label htmlFor="ort">Ort *</label>
      <input
        id="ort"
        name="ort"
        type="text"
        value={formData.ort}
        onChange={handleChange}
        required
        disabled={loading}
      />

      <div className="datetime-row">
        <div>
          <label htmlFor="von">Von *</label>
          <input
            id="von"
            name="von"
            type="datetime-local"
            value={formData.von}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="bis">Bis *</label>
          <input
            id="bis"
            name="bis"
            type="datetime-local"
            value={formData.bis}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
      </div>

      <label htmlFor="bild">Bild (PNG)</label>
      <input
        id="bild"
        name="bild"
        type="file"
        accept="image/png"
        onChange={handleBildChange}
        disabled={loading}
      />
      {bildPreview && (
        <img
          src={bildPreview}
          alt="Bild Vorschau"
          className="bild-preview"
          loading="lazy"
        />
      )}

      <div className="checkbox-row">
        <label>
          <input
            type="checkbox"
            name="alle"
            checked={formData.alle}
            onChange={handleChange}
            disabled={loading}
          />
          Für alle sichtbar
        </label>

        <label>
          <input
            type="checkbox"
            name="supporter"
            checked={formData.supporter}
            onChange={handleChange}
            disabled={loading}
          />
          Nur für Supporter
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? (eventId ? 'Aktualisiere...' : 'Erstelle...') : (eventId ? 'Event aktualisieren' : 'Event erstellen')}
      </button>
    </form>
  );
}
