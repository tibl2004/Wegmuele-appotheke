import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "./SpendenKontakt.scss";

const SpendenKontakt = () => {
  const [spenden, setSpenden] = useState(null);
  const [postKontakt, setPostKontakt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userTypes, setUserTypes] = useState([]);
  const [error, setError] = useState("");
  const [editingSpenden, setEditingSpenden] = useState(false);
  const [editedSpenden, setEditedSpenden] = useState({});
  const [editingPost, setEditingPost] = useState(false);
  const [editedPost, setEditedPost] = useState({});

  const token = localStorage.getItem("token");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // Rollen aus Token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserTypes(decoded.userTypes || []);
      } catch {
        setUserTypes([]);
      }
    }
  }, [token]);

  // Daten abrufen
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resSpenden, resPost] = await Promise.all([
          axios.get("https://jugehoerig-backend.onrender.com/api/spenden", axiosConfig),
          axios.get("https://jugehoerig-backend.onrender.com/api/postkontakt", axiosConfig)
        ]);
        setSpenden(resSpenden.data);
        setEditedSpenden(resSpenden.data);
        setPostKontakt(resPost.data);
        setEditedPost(resPost.data);
      } catch (err) {
        console.error(err);
        setError("Fehler beim Abrufen der Daten.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const isAdminOrVorstand = userTypes.some(role => ["vorstand", "admin"].includes(role));

  // Handlers Spenden
  const handleUpdateSpenden = async () => {
    try {
      const res = await axios.put(
        "https://jugehoerig-backend.onrender.com/api/spenden",
        editedSpenden,
        axiosConfig
      );
      alert(res.data.message);
      setSpenden(editedSpenden);
      setEditingSpenden(false);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren der Spendeninfos.");
    }
  };

  const handleDeleteSpenden = async () => {
    if (!window.confirm("Spendeninfos wirklich löschen?")) return;
    try {
      const res = await axios.delete(
        "https://jugehoerig-backend.onrender.com/api/spenden",
        axiosConfig
      );
      alert(res.data.message);
      setSpenden(null);
      setEditingSpenden(false);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen.");
    }
  };

  // Handlers Post-Kontakt
  const handleUpdatePost = async () => {
    try {
      const url = postKontakt
        ? "https://jugehoerig-backend.onrender.com/api/postkontakt"
        : "https://jugehoerig-backend.onrender.com/api/postkontakt";
      const method = postKontakt ? axios.put : axios.post;

      const res = await method(url, editedPost, axiosConfig);
      alert(res.data.message);
      setPostKontakt(editedPost);
      setEditingPost(false);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Speichern der Post-Kontaktinfos.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Post-Kontakt wirklich löschen?")) return;
    try {
      const res = await axios.delete(
        "https://jugehoerig-backend.onrender.com/api/post_kontakt",
        axiosConfig
      );
      alert(res.data.message);
      setPostKontakt(null);
      setEditingPost(false);
      setEditedPost({});
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen.");
    }
  };

  if (loading) return <p>Lädt...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="spenden-kontakt">
      <h2>Spendeninformationen</h2>
      <div className="spenden-card">
        {editingSpenden ? (
          ["iban","bank","clearing","swift","postcheck","hinweis"].map(field => (
            <label key={field} className="input-group">
              {field.toUpperCase()}:
              <input
                type="text"
                value={editedSpenden[field] || ""}
                onChange={e => setEditedSpenden({ ...editedSpenden, [field]: e.target.value })}
              />
            </label>
          ))
        ) : spenden ? (
          <>
            <p><strong>IBAN:</strong> {spenden.iban}</p>
            <p><strong>Bank:</strong> {spenden.bank}</p>
            <p><strong>Clearing:</strong> {spenden.clearing}</p>
            <p><strong>SWIFT:</strong> {spenden.swift}</p>
            <p><strong>Postcheck:</strong> {spenden.postcheck}</p>
            <p><strong>Hinweis:</strong> {spenden.hinweis}</p>
          </>
        ) : (
          <p>Keine Spendeninformationen vorhanden.</p>
        )}
      </div>

      {isAdminOrVorstand && (
        <div className="buttons">
          {editingSpenden ? (
            <>
              <button className="btn save" onClick={handleUpdateSpenden}>Speichern</button>
              <button className="btn cancel" onClick={() => { setEditingSpenden(false); setEditedSpenden(spenden); }}>Abbrechen</button>
            </>
          ) : spenden ? (
            <>
              <button className="btn edit" onClick={() => setEditingSpenden(true)}>Bearbeiten</button>
              <button className="btn delete" onClick={handleDeleteSpenden}>Löschen</button>
            </>
          ) : (
            <button className="btn edit" onClick={() => setEditingSpenden(true)}>Erstellen</button>
          )}
        </div>
      )}

      <h2>Post-Kontakt</h2>
      <div className="post-kontakt-card">
        {editingPost ? (
          ["firma","name","strasse","plz","ort"].map(field => (
            <label key={field} className="input-group">
              {field.charAt(0).toUpperCase() + field.slice(1)}:
              <input
                type="text"
                value={editedPost[field] || ""}
                onChange={e => setEditedPost({ ...editedPost, [field]: e.target.value })}
              />
            </label>
          ))
        ) : postKontakt ? (
          <>
            <p><strong>Firma:</strong> {postKontakt.firma}</p>
            <p><strong>Name:</strong> {postKontakt.name}</p>
            <p><strong>Straße:</strong> {postKontakt.strasse}</p>
            <p><strong>PLZ:</strong> {postKontakt.plz}</p>
            <p><strong>Ort:</strong> {postKontakt.ort}</p>
          </>
        ) : (
          <p>Keine Post-Kontaktinfos vorhanden.</p>
        )}
      </div>

      {isAdminOrVorstand && (
        <div className="buttons">
          {editingPost ? (
            <>
              <button className="btn save" onClick={handleUpdatePost}>Speichern</button>
              <button className="btn cancel" onClick={() => { setEditingPost(false); setEditedPost(postKontakt || {}); }}>Abbrechen</button>
            </>
          ) : postKontakt ? (
            <>
              <button className="btn edit" onClick={() => setEditingPost(true)}>Bearbeiten</button>
              <button className="btn delete" onClick={handleDeletePost}>Löschen</button>
            </>
          ) : (
            <button className="btn edit" onClick={() => setEditingPost(true)}>Erstellen</button>
          )}
        </div>
      )}
    </div>
  );
};

export default SpendenKontakt;
