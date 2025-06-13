import React, { useState } from "react";
import axios from "axios";
import "./CreateEventForm.scss";

export default function CreateEventForm() {
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
    preise: [{ preisbeschreibung: "", kosten: "" }]
  });

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

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

  const handlePriceChange = (index, field, value) => {
    const updated = [...formData.preise];
    updated[index][field] = value;
    setFormData({ ...formData, preise: updated });
  };

  const addPriceField = () => {
    setFormData({ ...formData, preise: [...formData.preise, { preisbeschreibung: "", kosten: "" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://jugehoerig-backend.onrender.com/api/event", formData);
      setMessage("🎉 Event erfolgreich erstellt!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Fehler beim Erstellen des Events.");
    }
  };

  return (
    <div className="create-event-form">
      <h2>Neues Event erstellen</h2>
      {message && <p className="form-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Titel*</label>
        <input type="text" name="titel" value={formData.titel} onChange={handleChange} required />

        <label>Beschreibung*</label>
        <textarea name="beschreibung" value={formData.beschreibung} onChange={handleChange} required />

        <label>Ort*</label>
        <input type="text" name="ort" value={formData.ort} onChange={handleChange} required />

        <label>Startzeit (Von)*</label>
        <input type="datetime-local" name="von" value={formData.von} onChange={handleChange} required />

        <label>Endzeit (Bis)*</label>
        <input type="datetime-local" name="bis" value={formData.bis} onChange={handleChange} required />

        <div className="checkbox-group">
          <label>
            <input type="checkbox" name="alle" checked={formData.alle} onChange={handleChange} />
            Für alle sichtbar
          </label>
          <label>
            <input type="checkbox" name="supporter" checked={formData.supporter} onChange={handleChange} />
            Supporter-Event
          </label>
        </div>

        <label>Bild (optional)</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {preview && <img src={preview} alt="Vorschau" className="image-preview" />}

        <label>Bildtitel</label>
        <input type="text" name="bildtitel" value={formData.bildtitel} onChange={handleChange} />

        <h3>Preisoptionen</h3>
        {formData.preise.map((preis, idx) => (
          <div key={idx} className="price-field">
            <input
              type="text"
              placeholder="Beschreibung"
              value={preis.preisbeschreibung}
              onChange={(e) => handlePriceChange(idx, "preisbeschreibung", e.target.value)}
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

        <button type="submit" className="submit-btn">Event erstellen</button>
      </form>
    </div>
  );
}
