import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import "./DienstleistungDetail.scss";

const DIENSTLEISTUNG_API = "https://wegm-hle-apotheke-backend.onrender.com/api/dienstleistungen";

export default function DienstleistungDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dienstleistung, setDienstleistung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("token");

  // Pop-up State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitel, setEditTitel] = useState("");
  const [editBeschreibung, setEditBeschreibung] = useState("");
  const [editBild, setEditBild] = useState(null);

  // Admin prüfen
  useEffect(() => {
    if (!token) return setIsAdmin(false);
    try {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.userTypes?.includes("admin") || false);
    } catch {
      setIsAdmin(false);
    }
  }, [token]);

  // Daten laden
  const loadDienstleistung = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${DIENSTLEISTUNG_API}/${id}`);
      setDienstleistung(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Dienstleistung konnte nicht geladen werden.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDienstleistung();
  }, [id]);

  // Edit Modal öffnen
  const openEditModal = () => {
    setEditTitel(dienstleistung.titel);
    setEditBeschreibung(dienstleistung.beschreibung);
    setEditBild(null);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditBild(null);
  };

  // Update
  const handleUpdate = async () => {
    if (!editTitel || !editBeschreibung) return alert("Titel und Beschreibung erforderlich.");
    try {
      const formData = new FormData();
      formData.append("titel", editTitel);
      formData.append("beschreibung", editBeschreibung);
      if (editBild) formData.append("bild", editBild);

      await axios.put(`${DIENSTLEISTUNG_API}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      closeEditModal();
      loadDienstleistung();
    } catch (err) {
      console.error(err);
      alert("Update fehlgeschlagen.");
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!window.confirm("Dienstleistung wirklich löschen?")) return;
    try {
      await axios.delete(`${DIENSTLEISTUNG_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Löschen fehlgeschlagen.");
    }
  };

  if (loading) return <div className="dienst-detail-wrapper">Lade...</div>;
  if (error) return <div className="dienst-detail-wrapper">{error}</div>;

  return (
    <div className="dienst-detail-wrapper">
      {/* Zurück Button */}
      <button className="back-btn" onClick={() => navigate(-1)}>← Zurück</button>

      {/* Dienstleistung */}
      <div className="dienst-card">
        {dienstleistung.bild && (
          <div
            className="dienst-bild"
            style={{ backgroundImage: `url(https://wegm-hle-apotheke-backend.onrender.com/uploads/dienstleistungen/${dienstleistung.bild})` }}
          ></div>
        )}
        <div className="dienst-info">
          <h1>{dienstleistung.titel}</h1>
          <p>{dienstleistung.beschreibung}</p>

          {isAdmin && (
            <div className="admin-actions">
              <button className="edit-btn" onClick={openEditModal}>✎ Bearbeiten</button>
              <button className="delete-btn" onClick={handleDelete}>✖ Löschen</button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Dienstleistung bearbeiten</h2>
            <input
              type="text"
              value={editTitel}
              onChange={(e) => setEditTitel(e.target.value)}
              placeholder="Titel"
            />
            <textarea
              value={editBeschreibung}
              onChange={(e) => setEditBeschreibung(e.target.value)}
              placeholder="Beschreibung"
            />
            <input type="file" onChange={(e) => setEditBild(e.target.files[0])} />
            <div className="modal-actions">
              <button onClick={handleUpdate}>Speichern</button>
              <button className="cancel" onClick={closeEditModal}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
