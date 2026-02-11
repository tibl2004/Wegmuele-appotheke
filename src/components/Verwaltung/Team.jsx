import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Team.scss";

const MITARBEITER_API = "https://wegm-hle-apotheke-backend.onrender.com/api/mitarbeiter";
const FUNKTIONEN_API = "https://wegm-hle-apotheke-backend.onrender.com/api/funktionen";

export default function Team() {
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [funktionenList, setFunktionenList] = useState([]);
  const [fotoFile, setFotoFile] = useState(null);
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [funktionen, setFunktionen] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMitarbeiter, setActiveMitarbeiter] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const [roles, setRoles] = useState([]);

  const isAdmin = roles.includes("admin");
  const isVorstand = roles.includes("vorstand");

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
  // Mitarbeiter & Funktionen laden
  // ======================
  const loadMitarbeiter = async () => {
    try {
      const res = await axios.get(MITARBEITER_API);
      const data = res.data.map(m => ({
        ...m,
        funktionen: Array.isArray(m.funktionen) ? m.funktionen : [],
        funktionenIds: Array.isArray(m.funktionen)
          ? m.funktionen.map(f => String(f.id))
          : [],
      }));
      setMitarbeiter(data);
    } catch (err) {
      console.error(err);
      setError("Mitarbeiter konnten nicht geladen werden.");
    }
  };

  const loadFunktionen = async () => {
    try {
      const res = await axios.get(FUNKTIONEN_API);
      setFunktionenList(res.data);
    } catch {
      setError("Funktionen konnten nicht geladen werden.");
    }
  };

  useEffect(() => {
    loadMitarbeiter();
    loadFunktionen();
  }, []);

  // ======================
  // MODAL ÖFFNEN / SCHLIESSEN
  // ======================
  const openModal = (m = null) => {
    if (m) {
      setActiveMitarbeiter(m);
      setVorname(m.vorname);
      setNachname(m.nachname);
      setFunktionen(m.funktionenIds || []);
    } else {
      setActiveMitarbeiter(null);
      setVorname("");
      setNachname("");
      setFunktionen([]);
    }
    setFotoFile(null);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveMitarbeiter(null);
  };

  // ======================
  // CREATE / UPDATE
  // ======================
  const saveMitarbeiter = async () => {
    if (!vorname || !nachname || funktionen.length === 0) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      return;
    }

    const formData = new FormData();
    formData.append("vorname", vorname);
    formData.append("nachname", nachname);
    formData.append("funktionen", JSON.stringify(funktionen));
    if (fotoFile) formData.append("foto", fotoFile);

    try {
      setLoading(true);
      if (activeMitarbeiter) {
        await axios.put(`${MITARBEITER_API}/${activeMitarbeiter.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(MITARBEITER_API, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closeModal();
      loadMitarbeiter();
    } catch {
      setError(activeMitarbeiter ? "Update fehlgeschlagen." : "Create fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await axios.delete(`${MITARBEITER_API}/${id}`);
      loadMitarbeiter();
    } catch {
      setError("Löschen fehlgeschlagen.");
    }
  };

  return (
    <div className="team-page">
      <h1>Team</h1>

      {isAdmin && (
        <button className="add-btn" onClick={() => openModal()}>
          ➕ Neuer Mitarbeiter
        </button>
      )}

      <div className="grid">
        {mitarbeiter.map(m => (
          <div key={m.id} className="team-item">
            <img src={m.foto} alt={`${m.vorname} ${m.nachname}`} />
            <div className="info">
              <strong>{m.vorname} {m.nachname}</strong>
              <span>{m.funktionen.map(f => f.name).join(", ") || "Keine Funktion"}</span>
            </div>
            {(isAdmin || isVorstand) && (
              <div className="actions">
                {isAdmin && <button onClick={() => openModal(m)}>✎</button>}
                <button onClick={() => handleDelete(m.id)}>✖</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{activeMitarbeiter ? "Mitarbeiter bearbeiten" : "Neuen Mitarbeiter erstellen"}</h2>

            {error && <div className="error">{error}</div>}

            <input
              type="text"
              placeholder="Vorname"
              value={vorname}
              onChange={e => setVorname(e.target.value)}
            />
            <input
              type="text"
              placeholder="Nachname"
              value={nachname}
              onChange={e => setNachname(e.target.value)}
            />

            <div className="funktionen">
              {funktionenList.map(f => (
                <label key={f.id}>
                  <input
                    type="checkbox"
                    value={f.id}
                    checked={funktionen.includes(String(f.id))}
                    onChange={e => {
                      const val = String(f.id);
                      setFunktionen(prev =>
                        e.target.checked
                          ? [...prev, val]
                          : prev.filter(id => id !== val)
                      );
                    }}
                  />
                  {f.name}
                </label>
              ))}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={e => setFotoFile(e.target.files[0])}
            />

            <div className="modal-actions">
              <button onClick={saveMitarbeiter} disabled={loading}>
                {loading ? "Speichern…" : "Speichern"}
              </button>
              <button onClick={closeModal}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
