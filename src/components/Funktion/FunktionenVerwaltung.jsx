import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "./FunktionenVerwaltung.scss";

const FunktionenVerwaltung = () => {
  const [funktionen, setFunktionen] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchFunktionen = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/funktionen");
      setFunktionen(res.data);
    } catch (err) {
      console.error(err);
      setError("Funktionen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunktionen();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Funktionsname ist erforderlich.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`/api/funktionen/${editingId}`, { name });
        setEditingId(null);
      } else {
        await axios.post("/api/funktionen", { name });
      }
      setName("");
      fetchFunktionen();
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Fehler beim Speichern der Funktion.");
    }
  };

  const handleEdit = (funktion) => {
    setEditingId(funktion.id);
    setName(funktion.name);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Funktion wirklich löschen?")) return;
    try {
      await axios.delete(`/api/funktionen/${id}`);
      fetchFunktionen();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Fehler beim Löschen der Funktion.");
    }
  };

  return (
    <div className="funktionen-container">
      <h1>Funktionen Verwaltung</h1>

      <form onSubmit={handleSubmit} className="funktion-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Funktionsname"
        />
        <button type="submit">
          <FaPlus />
          {editingId ? "Aktualisieren" : "Erstellen"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div>Lädt...</div>
      ) : (
        <div className="funktionen-list">
          {funktionen.length === 0 && (
            <p className="empty-message">Keine Funktionen vorhanden.</p>
          )}
          {funktionen.map((f) => (
            <div key={f.id} className="funktion-card">
              <span className="funktion-name">{f.name}</span>
              <div className="action-buttons">
                <button className="edit" onClick={() => handleEdit(f)}>
                  <FaEdit /> Bearbeiten
                </button>
                <button className="delete" onClick={() => handleDelete(f.id)}>
                  <FaTrash /> Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FunktionenVerwaltung;
