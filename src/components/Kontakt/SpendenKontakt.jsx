import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SpendenKontakt.scss";

const SpendenKontakt = () => {
  const [spenden, setSpenden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserType(payload.userTypes[0]);
    }
  }, []);

  useEffect(() => {
    const fetchSpenden = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://jugehoerig-backend.onrender.com/api/spenden", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSpenden(res.data);
      } catch (err) {
        console.error(err);
        setError("Fehler beim Abrufen der Spendeninfos.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpenden();
  }, []);

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const updated = await axios.put(
        "https://jugehoerig-backend.onrender.com/api/spenden",
        { ...spenden },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(updated.data.message);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Aktualisieren.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Spendeninfos wirklich löschen?")) return;
    try {
      const token = localStorage.getItem("token");
      const deleted = await axios.delete("https://jugehoerig-backend.onrender.com/api/spenden", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(deleted.data.message);
      setSpenden(null);
    } catch (err) {
      console.error(err);
      alert("Fehler beim Löschen.");
    }
  };

  if (loading) return <p>Lädt...</p>;
  if (error) return <p>{error}</p>;
  if (!spenden) return <p>Keine Spendeninformationen vorhanden.</p>;

  return (
    <div className="spenden-kontakt">
      <h2>Spenden</h2>
      <div className="spenden-card">
        <p><strong>IBAN Nummer von Jugehörig:</strong> {spenden.iban}</p>
        <p>{spenden.bank}</p>
        <p><strong>Clearing Nr.</strong> {spenden.clearing}</p>
        <p><strong>SWIFT-Code:</strong> {spenden.swift}</p>
        <p><strong>Postcheckkonto Nr.</strong> {spenden.postcheck}</p>
        <p>{spenden.hinweis}</p>
      </div>

      {userType === "vorstand" && (
        <div className="buttons">
          <button onClick={handleUpdate}>Update</button>
          <button onClick={handleDelete} style={{ marginLeft: "10px", color: "red" }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default SpendenKontakt;
