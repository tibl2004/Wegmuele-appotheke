import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "./Home.scss";

const API = "https://wegm-hle-apotheke-backend.onrender.com/api/oeffnungszeiten";

const Home = () => {
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [wochentag, setWochentag] = useState("");
  const [von, setVon] = useState("");
  const [bis, setBis] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const isAdmin = roles.includes("admin");

  // ======================
  // Rollen dekodieren
  // ======================
  useEffect(() => {
    if (!token) return setRoles([]);
    try {
      const decoded = jwtDecode(token);
      setRoles(decoded.userTypes || []);
    } catch {
      setRoles([]);
    }
  }, [token]);

  // ======================
  // Öffnungszeiten laden
  // ======================
  const loadData = async () => {
    try {
      const res = await axios.get(API);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================
  // CRUD Modal
  // ======================
  const openModal = (item = null) => {
    if (item) {
      setActiveItem(item);
      setWochentag(item.wochentag);
      setVon(item.von || "");
      setBis(item.bis || "");
    } else {
      setActiveItem(null);
      setWochentag("");
      setVon("");
      setBis("");
    }
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveItem(null);
  };

  const saveItem = async () => {
    if (!wochentag) return setError("Wochentag erforderlich.");
    try {
      if (activeItem) {
        await axios.put(
          `${API}/${activeItem.id}`,
          { wochentag, von, bis },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          API,
          { wochentag, von, bis },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeModal();
      loadData();
    } catch {
      setError("Speichern fehlgeschlagen.");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await axios.delete(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadData();
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  };

  return (
    <div className="home-container">

      {/* ======================
          WILLKOMMEN + ÖFFNUNGSZEITEN
      ====================== */}
      <div className="welcome-zeiten-wrapper">
        <section className="welcome-section">
          <div className="welcome-box">
            <h1>Herzlich willkommen in der</h1>
            <h2>Wegmühle-Apotheke Ostermundigen</h2>
            <p>Da für Sie, ganz in Ihrer Nähe.</p>
            <p>Seit 1997; unabhängig, persönlich, engagiert</p>
          </div>
        </section>

        <section className="zeiten-section">
          <h2>🕒 Öffnungszeiten</h2>

          {isAdmin && (
            <button className="add-btn" onClick={() => openModal()}>
              ➕
            </button>
          )}
<div className="zeiten-list">
  {items.map((item, index) => (
    <div key={index} className="zeiten-item">
      <div className="text">
        <strong>{item.wochentage.join(", ")}</strong>
        <span>{item.geschlossen ? "geschlossen" : item.zeiten.join(", ")}</span>
      </div>

      {isAdmin && (
        <div className="actions">
          <button onClick={() => openModal(item)}>✎</button>
          <button onClick={() => deleteItem(item.id)}>✖</button>
        </div>
      )}
    </div>
  ))}
</div>


        </section>
      </div>

      {/* ======================
          MODAL (ADMIN ONLY)
      ====================== */}
      {isAdmin && showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>
              {activeItem
                ? "Öffnungszeiten bearbeiten"
                : "Öffnungszeiten hinzufügen"}
            </h2>

            {error && <div className="error">{error}</div>}

            <input
              placeholder="Wochentag (Mo, Di...)"
              value={wochentag}
              onChange={(e) => setWochentag(e.target.value)}
            />

            <input
              type="time"
              value={von}
              onChange={(e) => setVon(e.target.value)}
            />

            <input
              type="time"
              value={bis}
              onChange={(e) => setBis(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={saveItem}>Speichern</button>
              <button className="cancel" onClick={closeModal}>
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
