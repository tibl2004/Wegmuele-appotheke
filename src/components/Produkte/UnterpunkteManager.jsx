import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "./UnterpunkteManager.scss";

const KATEGORIEN_API = "https://wegm-hle-apotheke-backend.onrender.com/api/kategorien";

export default function UnterpunkteManager() {
  const [kategorien, setKategorien] = useState([]);
  const [newKategorieTitel, setNewKategorieTitel] = useState("");
  const [newUnterpunktName, setNewUnterpunktName] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const token = localStorage.getItem("token");

  // ======================
  // Admin prüfen
  // ======================
  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.userTypes?.includes("admin") || false);
    } catch {
      setIsAdmin(false);
    }
  }, [token]);

  // ======================
  // Daten laden
  // ======================
  const loadData = async () => {
    try {
      const res = await axios.get(KATEGORIEN_API);
      setKategorien(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ======================
  // Kategorie erstellen (Admin)
  // ======================
  const createKategorie = async () => {
    if (!newKategorieTitel) return;
    try {
      await axios.post(
        KATEGORIEN_API,
        { titel: newKategorieTitel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewKategorieTitel("");
      loadData();
    } catch {
      alert("Kategorie erstellen fehlgeschlagen");
    }
  };

  // ======================
  // Unterpunkt erstellen (Admin)
  // ======================
  const createUnterpunkt = async (kategorieId) => {
    const name = newUnterpunktName[kategorieId];
    if (!name) return;
    try {
      await axios.post(
        `${KATEGORIEN_API}/unterpunkt`,
        { kategorie_id: kategorieId, name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewUnterpunktName(prev => ({ ...prev, [kategorieId]: "" }));
      loadData();
    } catch {
      alert("Unterpunkt erstellen fehlgeschlagen");
    }
  };

  // ======================
  // Unterpunkt bearbeiten (Admin)
  // ======================
  const editUnterpunkt = async (id) => {
    const name = prompt("Neuer Name:");
    if (!name) return;
    try {
      await axios.put(
        `${KATEGORIEN_API}/${id}`, // PUT-Route in deinem Controller
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadData();
    } catch {
      alert("Unterpunkt bearbeiten fehlgeschlagen");
    }
  };

  // ======================
  // Unterpunkt löschen (Admin)
  // ======================
  const deleteUnterpunkt = async (id) => {
    if (!window.confirm("Unterpunkt wirklich löschen?")) return;
    try {
      await axios.delete(`${KATEGORIEN_API}/unterpunkt/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch {
      alert("Unterpunkt löschen fehlgeschlagen");
    }
  };

  // ======================
  // Kategorie löschen (Admin)
  // ======================
  const deleteKategorie = async (id) => {
    if (!window.confirm("Kategorie wirklich löschen?")) return;
    try {
      await axios.delete(`${KATEGORIEN_API}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      loadData();
    } catch {
      alert("Kategorie löschen fehlgeschlagen");
    }
  };

  // ======================
  // Render
  // ======================
  return (
    <div className="unterpunkte-wrapper">
      <h1>Unterpunkte & Kategorien</h1>

      {/* Kategorie erstellen */}
      {isAdmin && (
        <div className="add-section">
          <input
            type="text"
            placeholder="Neue Kategorie"
            value={newKategorieTitel}
            onChange={(e) => setNewKategorieTitel(e.target.value)}
          />
          <button className="add" onClick={createKategorie}>➕ Kategorie erstellen</button>
        </div>
      )}

      {/* Kategorien + Unterpunkte */}
      {kategorien.map(kategorie => (
        <div key={kategorie.id} className="kategorie-box">
          <div className="kategorie-header">
            <h2>{kategorie.titel}</h2>
            {isAdmin && (
              <button className="delete" onClick={() => deleteKategorie(kategorie.id)}>✖ Kategorie löschen</button>
            )}
          </div>

          <ul className="unterpunkte-list">
            {kategorie.unterpunkte.map(up => (
              <li key={up.id}>
                {up.name}
                {isAdmin && (
                  <span className="actions">
                    <button className="edit" onClick={() => editUnterpunkt(up.id)}>✎</button>
                    <button className="delete" onClick={() => deleteUnterpunkt(up.id)}>✖</button>
                  </span>
                )}
              </li>
            ))}
          </ul>

          {/* Unterpunkt erstellen */}
          {isAdmin && (
            <div className="add-section">
              <input
                type="text"
                placeholder="Neuer Unterpunkt"
                value={newUnterpunktName[kategorie.id] || ""}
                onChange={(e) => setNewUnterpunktName(prev => ({ ...prev, [kategorie.id]: e.target.value }))}
              />
              <button className="add" onClick={() => createUnterpunkt(kategorie.id)}>➕ Unterpunkt erstellen</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
