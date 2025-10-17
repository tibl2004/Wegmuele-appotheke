import React, { useEffect, useState } from "react";
import axios from "axios";
import * as FaIcons from "react-icons/fa";
import "./Footer.scss";

const Footer = () => {
  const [impressum, setImpressum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", nachricht: "" });
  const [formStatus, setFormStatus] = useState("");

  // Impressum + Logo laden
  useEffect(() => {
    const fetchImpressum = async () => {
      try {
        const res = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/impressum"
        );
        setImpressum(res.data);
      } catch (err) {
        console.error(err);
        setError("Fehler beim Laden des Impressums.");
      } finally {
        setLoading(false);
      }
    };
    fetchImpressum();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.nachricht) {
      setFormStatus("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    try {
      const response = await axios.post(
        "https://jugehoerig-backend.onrender.com/api/anfrage",
        form
      );

      if (response.status === 201) {
        setFormStatus(
          "Vielen Dank! Ihre Anfrage wurde erfolgreich versendet. Sie erhalten eine Bestätigungsmail."
        );
        setForm({ name: "", email: "", nachricht: "" });
      } else {
        setFormStatus(
          "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
        );
      }
    } catch (err) {
      console.error("Fehler beim Senden der Anfrage:", err);
      setFormStatus(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const getIcon = (iconName) => {
    if (!iconName) return <FaIcons.FaLink />;
    const IconComponent = FaIcons[`Fa${iconName}`];
    return IconComponent ? <IconComponent /> : <FaIcons.FaLink />;
  };

  if (loading) return <div className="impressum-loading">Lade Inhalte...</div>;
  if (error) return <div className="impressum-error">{error}</div>;

  return (
    <div className="footer-container">
      {/* Impressum links */}
      <div className="impressum-container">
        {impressum?.logo && (
          <div className="impressum-logo">
            <img
              src={`data:image/png;base64,${impressum.logo}`}
              alt="Logo"
            />
          </div>
        )}

        <p>{impressum?.text}</p>

        {impressum?.adresse && (
          <div className="impressum-adresse">
            <strong>Adresse:</strong>{" "}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                impressum.adresse
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {impressum.adresse}
            </a>
          </div>
        )}

        {impressum?.links?.length > 0 && (
          <div className="impressum-links">
            <h3>Weitere Links:</h3>
            <ul>
              {impressum.links.map((link) => (
                <li key={link.id}>
                  <span className="impressum-link-icon">{getIcon(link.icon)}</span>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Anfrageformular rechts */}
      <div className="anfrage-formular">
        <h3>Schreiben Sie uns</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Ihr Name*"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Ihre E-Mail*"
            value={form.email}
            onChange={handleChange}
            required
          />
          <textarea
            name="nachricht"
            placeholder="Ihre Nachricht*"
            rows="4"
            value={form.nachricht}
            onChange={handleChange}
            required
          />
          <button type="submit">Absenden</button>
        </form>
        {formStatus && <p className="form-status">{formStatus}</p>}
      </div>
    </div>
  );
};

export default Footer;
