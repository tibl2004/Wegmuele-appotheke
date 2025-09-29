import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CreateEventForm.scss";

export default function CreateEventForm() {
  const [eventId, setEventId] = useState(null);
  const [formData, setFormData] = useState({
    titel: "",
    beschreibung: "",
    ort: "",
    von: "",
    bis: "",
    alle: false,
    supporter: false,
    bild: "",
    bildtitel: "",
    preise: [{ preisbeschreibung: "", kosten: "" }],
  });

  const [formFelder, setFormFelder] = useState([
    { feldname: "Vorname", typ: "text", pflicht: true },
    { feldname: "Name", typ: "text", pflicht: true },

  ]);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // Nächste Event-ID laden
  useEffect(() => {
    axios
      .get("https://jugehoerig-backend.onrender.com/api/events/nextId", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setEventId(res.data.nextId))
      .catch((err) => console.error("Fehler beim Laden der Event-ID:", err));
  }, [token]);

  // Input-Felder ändern
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  // Bild-Upload zu Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, bild: reader.result });
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Preisfelder ändern
  const handlePriceChange = (index, field, value) => {
    const updated = [...formData.preise];
    updated[index][field] = field === "kosten" ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, preise: updated });
  };

  // Neues Preisfeld hinzufügen
  const addPriceField = () => {
    setFormData({
      ...formData,
      preise: [...formData.preise, { preisbeschreibung: "", kosten: "" }],
    });
  };

  // Formularfelder ändern
  const handleFeldChange = (index, field, value) => {
    const updated = [...formFelder];
    updated[index][field] = value;
    setFormFelder(updated);
  };

  // Neues Feld hinzufügen
  const addFormField = () => {
    setFormFelder([...formFelder, { feldname: "", typ: "text", pflicht: false }]);
  };

  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      // Leere Preise entfernen
      payload.preise = payload.preise.filter(
        (p) => p.preisbeschreibung && p.kosten !== ""
      );

      // Event speichern
      await axios.post(
        "https://jugehoerig-backend.onrender.com/api/event",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Formularfelder anlegen
      if (formFelder.length > 0 && eventId) {
        await axios.post(
          "https://jugehoerig-backend.onrender.com/api/events/form",
          { eventId, felder: formFelder },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage("🎉 Event + Formular erfolgreich erstellt!");
      // Reset
      setFormData({
        titel: "",
        beschreibung: "",
        ort: "",
        von: "",
        bis: "",
        alle: false,
        supporter: false,
        bild: "",
        bildtitel: "",
        preise: [{ preisbeschreibung: "", kosten: "" }],
      });
      setFormFelder([{ feldname: "E-Mail", typ: "email", pflicht: true }]);
      setPreview(null);
    } catch (err) {
      console.error(
        "Fehler beim Erstellen:",
        err.response?.data || err.message
      );
      setMessage("❌ Fehler beim Erstellen.");
    }
  };

  return (
    <div className="create-event-form">
      <h2>Neues Event erstellen</h2>
      {eventId && <p className="event-id">Nächste Event-ID: {eventId}</p>}
      {message && <p className="form-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>Titel*</label>
        <input
          type="text"
          name="titel"
          value={formData.titel}
          onChange={handleChange}
          required
        />

        <label>Beschreibung*</label>
        <textarea
          name="beschreibung"
          value={formData.beschreibung}
          onChange={handleChange}
          required
        />

        <label>Ort*</label>
        <input
          type="text"
          name="ort"
          value={formData.ort}
          onChange={handleChange}
          required
        />

        <label>Startzeit (Von)*</label>
        <input
          type="datetime-local"
          name="von"
          value={formData.von}
          onChange={handleChange}
          required
        />

        <label>Endzeit (Bis)*</label>
        <input
          type="datetime-local"
          name="bis"
          value={formData.bis}
          onChange={handleChange}
          required
        />

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              name="alle"
              checked={formData.alle}
              onChange={handleChange}
            />
            Für alle sichtbar
          </label>
          <label>
            <input
              type="checkbox"
              name="supporter"
              checked={formData.supporter}
              onChange={handleChange}
            />
            Supporter-Event
          </label>
        </div>

        <label>Bild (optional)</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {preview && (
          <img src={preview} alt="Vorschau" className="image-preview" />
        )}

        <label>Bildtitel</label>
        <input
          type="text"
          name="bildtitel"
          value={formData.bildtitel}
          onChange={handleChange}
        />

        <h3>Preisoptionen</h3>
        {formData.preise.map((preis, idx) => (
          <div key={idx} className="price-field">
            <input
              type="text"
              placeholder="Beschreibung"
              value={preis.preisbeschreibung}
              onChange={(e) =>
                handlePriceChange(idx, "preisbeschreibung", e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Kosten"
              value={preis.kosten}
              onChange={(e) => handlePriceChange(idx, "kosten", e.target.value)}
            />
          </div>
        ))}
        <button type="button" className="add-price" onClick={addPriceField}>
          + Weitere Preisoption
        </button>

        <h3>Formularfelder</h3>
        {formFelder.map((feld, idx) => (
          <div key={idx} className="form-field">
            <input
              type="text"
              placeholder="Feldname"
              value={feld.feldname}
              onChange={(e) =>
                handleFeldChange(idx, "feldname", e.target.value)
              }
            />
            <select
              value={feld.typ}
              onChange={(e) => handleFeldChange(idx, "typ", e.target.value)}
            >
              <option value="text">Text</option>
              <option value="email">E-Mail</option>
              <option value="number">Nummer</option>
              <option value="date">Datum</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={feld.pflicht}
                onChange={(e) =>
                  handleFeldChange(idx, "pflicht", e.target.checked)
                }
              />
              Pflichtfeld
            </label>
          </div>
        ))}
        <button type="button" onClick={addFormField}>
          + Feld hinzufügen
        </button>

        <button type="submit" className="submit-btn">
          Event + Formular erstellen
        </button>
      </form>
    </div>
  );
}
