import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./Vorstand.scss";

const Vorstand = () => {
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();

  // 🔹 Token auslesen & Rollen bestimmen
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const roles = decoded?.userTypes || [];
      setUserRoles(roles);
    } catch (err) {
      console.error("Token ungültig:", err);
      setUserRoles([]);
    }
  }, []);

  const isVorstandOrAdmin = userRoles.some(role =>
    ["vorstand", "admin"].includes(role)
  );

  // 🔹 Daten vom Backend abrufen
  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchVorstandFotos = async () => {
      try {
        const res = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/vorstand/fotos",
          token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {}
        );
        setVorstand(res.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Fehler beim Laden der Vorstandsmitglieder.");
      } finally {
        setLoading(false);
      }
    };
    fetchVorstandFotos();
  }, []);

  // 🔹 Navigation zur Erstellen-Seite
  const handleCreateNewClick = () => navigate("/vorstand-erstellen");

  if (loading) return <div className="loading">Lade Vorstandsmitglieder...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <section className="vorstand-section">
      <div className="vorstand-header">
        <h2>Vorstandsmitglieder</h2>
        {isVorstandOrAdmin && (
          <button className="create-button" onClick={handleCreateNewClick}>
            + Neuer Vorstand
          </button>
        )}
      </div>

      {vorstand.length === 0 ? (
        <p className="no-data">Keine Vorstandsmitglieder gefunden.</p>
      ) : (
        <ul className="vorstand-list">
          {vorstand.map(({ id, vorname, nachname, rolle, foto, beschreibung }) => (
            <li key={id} className="vorstand-item">
              <div className="foto-wrapper">
                {foto ? (
                  <img
                    src={`data:image/png;base64,${foto}`}
                    alt={`${vorname} ${nachname}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="foto-placeholder">Kein Bild</div>
                )}
              </div>
              <div className="info">
                <h3>{vorname} {nachname}</h3>
                <p className="rolle">{rolle}</p>
                {beschreibung && <p className="beschreibung">{beschreibung}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default Vorstand;
