import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaCheckSquare } from "react-icons/fa";
import "./SubscribeForm.scss";

const SubscribeForm = () => {
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    email: "",
    newsletter_optin: false,
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.vorname || !formData.nachname || !formData.email) {
      return setMessage({ type: "error", text: "Bitte alle Felder ausfüllen" });
    }

    if (!formData.newsletter_optin) {
      return setMessage({ type: "error", text: "Bitte bestätige den Newsletter-Opt-in" });
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/newsletter/subscribe", formData);
      setMessage({ type: "success", text: res.data.message });
      setFormData({
        vorname: "",
        nachname: "",
        email: "",
        newsletter_optin: false,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Fehler bei der Anmeldung",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="newsletter-form">
      <h2>Newsletter abonnieren</h2>
      <p className="intro">
        Erhalte monatlich exklusive Infos über Events, Berichte und neue Blogartikel.
      </p>
      <p className="history">
        Letzte Ausgaben findest du hier: <a href="/newsletters">Newsletters Archiv</a>
      </p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            name="vorname"
            placeholder="Vorname"
            value={formData.vorname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaUser className="icon" />
          <input
            type="text"
            name="nachname"
            placeholder="Nachname"
            value={formData.nachname}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaEnvelope className="icon" />
          <input
            type="email"
            name="email"
            placeholder="E-Mail-Adresse"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="newsletter_optin"
            checked={formData.newsletter_optin}
            onChange={handleChange}
          />
          Ja, ich möchte den Newsletter erhalten und stimme der Verarbeitung meiner Daten zu.
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Sende..." : "Abonnieren"}
        </button>
      </form>

      {message && (
        <p className={message.type === "error" ? "error-message" : "success-message"}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default SubscribeForm;
