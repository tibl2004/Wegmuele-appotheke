import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MeinProfil.scss";

function MeinProfil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    adresse: "",
    plz: "",
    ort: "",
    telefon: "",
    email: "",
    beschreibung: "",
    benutzername: "",
    fotoFile: null, // Datei-Objekt
    fotoPreview: null // für Bildvorschau
  });

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://jugehoerig-backend.onrender.com/api/vorstand/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfil(response.data);
        setFormData({
          vorname: response.data.vorname || "",
          nachname: response.data.nachname || "",
          adresse: response.data.adresse || "",
          plz: response.data.plz || "",
          ort: response.data.ort || "",
          telefon: response.data.telefon || "",
          email: response.data.email || "",
          beschreibung: response.data.beschreibung || "",
          benutzername: response.data.benutzername || "",
          fotoFile: null,
          fotoPreview: response.data.foto ? `data:image/png;base64,${response.data.foto}` : null,
        });
      } catch (err) {
        console.error("Fehler beim Laden des Profils:", err);
        setError("Profil konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfil();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        fotoFile: file,
        fotoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
  
      // Alle Felder anhängen
      [
        "vorname", "nachname", "adresse", "plz", "ort",
        "telefon", "email", "beschreibung", "benutzername"
      ].forEach(key => data.append(key, formData[key]));
  
      // Nur Bild anhängen, wenn neues vorhanden
      if (formData.fotoFile) {
        data.append("foto", formData.fotoFile);
      }
  
      const response = await axios.put(
        "https://jugehoerig-backend.onrender.com/api/vorstand/me",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
  
      alert(response.data.message || "Profil erfolgreich aktualisiert.");
      setEditMode(false);
  
      // Profil neu setzen (inkl. neuem Bild)
      setProfil(prev => ({
        ...prev,
        ...formData,
        foto: formData.fotoFile
          ? formData.fotoPreview.split(",")[1] // Base64 ohne Prefix
          : prev.foto
      }));
    } catch (err) {
      console.error("Fehler beim Aktualisieren:", err);
      alert("Fehler beim Aktualisieren des Profils.");
    }
  };
  

  if (loading) return <p>Profil wird geladen...</p>;
  if (error) return <p>{error}</p>;
  if (!profil) return <p>Kein Profil gefunden.</p>;

  return (
    <div className="mein-profil-container">
      <h2>Mein Profil</h2>

      {!editMode ? (
        <>
          <div className="profil-card">
            {profil.foto && (
              <img
                src={`data:image/png;base64,${profil.foto}`}
                alt={`Foto von ${profil.vorname} ${profil.nachname}`}
                className="vorstand-foto"
              />
            )}
            <div className="profil-details">
              <h3>{profil.vorname} {profil.nachname}</h3>
              <p><b>Adresse:</b> {profil.adresse}, {profil.plz} {profil.ort}</p>
              <p><b>Telefon:</b> {profil.telefon}</p>
              <p><b>E-Mail:</b> {profil.email}</p>
              <p><b>Beschreibung:</b> {profil.beschreibung}</p>
              <p><b>Benutzername:</b> {profil.benutzername}</p>
            </div>
          </div>
          <button onClick={() => setEditMode(true)}>Profil bearbeiten</button>
        </>
      ) : (
        <form className="profil-form" onSubmit={handleSubmit}>
          <label>
            Vorname:
            <input type="text" name="vorname" value={formData.vorname} onChange={handleInputChange} required />
          </label>
          <label>
            Nachname:
            <input type="text" name="nachname" value={formData.nachname} onChange={handleInputChange} required />
          </label>
          <label>
            Adresse:
            <input type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} />
          </label>
          <label>
            PLZ:
            <input type="text" name="plz" value={formData.plz} onChange={handleInputChange} />
          </label>
          <label>
            Ort:
            <input type="text" name="ort" value={formData.ort} onChange={handleInputChange} />
          </label>
          <label>
            Telefon:
            <input type="text" name="telefon" value={formData.telefon} onChange={handleInputChange} />
          </label>
          <label>
            E-Mail:
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
          </label>
          <label>
            Beschreibung:
            <textarea name="beschreibung" value={formData.beschreibung} onChange={handleInputChange} />
          </label>
          <label>
            Benutzername:
            <input type="text" name="benutzername" value={formData.benutzername} onChange={handleInputChange} />
          </label>
          <label>
            Foto:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {formData.fotoPreview && (
            <img src={formData.fotoPreview} alt="Vorschau" style={{ maxWidth: "200px", marginTop: "10px" }} />
          )}
          <div style={{ marginTop: "15px" }}>
            <button type="submit">Speichern</button>
            <button type="button" onClick={() => setEditMode(false)} style={{ marginLeft: "10px" }}>Abbrechen</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default MeinProfil;
