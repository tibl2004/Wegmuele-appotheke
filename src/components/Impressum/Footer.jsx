import React, { useEffect, useState } from "react";
import axios from "axios";
import * as FaIcons from "react-icons/fa"; // Alle FontAwesome Icons importieren
import "./Footer.scss";

const Footer = () => {
  const [impressum, setImpressum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImpressum = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/impressum",
          { headers: { Authorization: `Bearer ${token}` } }
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

  if (loading) return <div>Lade Impressum...</div>;
  if (error) return <div>{error}</div>;
  if (!impressum) return null;

  // Funktion, die dynamisch Icons anhand des Namens auswählt
  const getIcon = (iconName) => {
    if (!iconName) return <FaIcons.FaLink />; // Standard-Fallback
    const IconComponent = FaIcons[`Fa${iconName}`];
    return IconComponent ? <IconComponent /> : <FaIcons.FaLink />;
  };

  return (
    <div className="impressum-container">
      {impressum.logo && (
        <div className="impressum-logo">
          <img src={`data:image/png;base64,${impressum.logo}`} alt="Logo" />
        </div>
      )}

      <p>{impressum.text}</p>

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

      {impressum.links && impressum.links.length > 0 && (
        <div className="impressum-links">
          <h3>Weitere Links:</h3>
          <ul>
            {impressum.links.map((link) => (
              <li key={link.id}>
                <span className="impressum-link-icon">{getIcon(link.icon)}</span>{" "}
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Footer;
