// EventDetail.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventDetail.scss";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { FiEdit, FiTrash2, FiCalendar } from "react-icons/fi";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editMode, setEditMode] = useState(location.state?.edit === true);

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const [isAdminOrVorstand, setIsAdminOrVorstand] = useState(false);

  // --- Event und UserType laden ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        const roles = parsedUser.userTypes || "";
        setIsAdminOrVorstand(
          roles.toLowerCase() === "admin" || roles.toLowerCase() === "vorstand"
        );
      } catch {
        setIsAdminOrVorstand(false);
      }
    }

    const loadEvent = async () => {
      try {
        const res = await axios.get(
          `https://jugehoerig-backend.onrender.com/api/event/${id}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const ev = res.data;
        setEvent(ev);

        const initialData = {};
        (ev.formular || []).forEach(f => (initialData[f.feldname] = ""));

        setFormData({
          titel: ev.titel || "",
          beschreibung: ev.beschreibung || "",
          ort: ev.ort || "",
          von: ev.von ? new Date(ev.von).toISOString().slice(0,16) : "",
          bis: ev.bis ? new Date(ev.bis).toISOString().slice(0,16) : "",
          alle: !!ev.alle,
          supporter: !!ev.supporter,
          bild: null,
          bildtitel: ev.bildtitel || "",
          preise: ev.preise || [],
          felder: ev.formular || []
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Event konnte nicht geladen werden");
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  // --- Allgemeines Input-Handling ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // --- Bildhandling ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          bild: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Bitte nur PNG-Dateien hochladen.");
      e.target.value = null;
    }
  };

  // --- Preise ---
  const handlePreisChange = (index, field, value) => {
    setFormData(prev => {
      const preise = [...(prev.preise || [])];
      preise[index][field] = field === "kosten" ? Number(value) : value;
      return { ...prev, preise };
    });
  };
  const addPreis = () => setFormData(prev => ({ ...prev, preise: [...(prev.preise || []), { preisbeschreibung: "", kosten: 0 }] }));
  const removePreis = (index) => setFormData(prev => ({ ...prev, preise: prev.preise.filter((_, i) => i !== index) }));

  // --- Formularfelder ---
  const handleFeldChange = (index, field, value) => {
    setFormData(prev => {
      const felder = [...(prev.felder || [])];
      felder[index][field] = value;
      return { ...prev, felder };
    });
  };
  const addFeld = () => setFormData(prev => ({ ...prev, felder: [...(prev.felder || []), { feldname: "", typ: "text", pflicht: false, optionen: [] }] }));
  const removeFeld = (index) => setFormData(prev => ({ ...prev, felder: prev.felder.filter((_, i) => i !== index) }));

  // --- Bearbeitungsmodus ---
  const handleEditToggle = () => {
    if (editMode && event) {
      setFormData({
        titel: event.titel || "",
        beschreibung: event.beschreibung || "",
        ort: event.ort || "",
        von: event.von ? new Date(event.von).toISOString().slice(0,16) : "",
        bis: event.bis ? new Date(event.bis).toISOString().slice(0,16) : "",
        alle: !!event.alle,
        supporter: !!event.supporter,
        bild: null,
        bildtitel: event.bildtitel || "",
        preise: event.preise || [],
        felder: event.formular || []
      });
    }
    setEditMode(prev => !prev);
    setSaveError(null);
  };

  // --- Event speichern ---
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = { ...formData };
      await axios.put(
        `https://jugehoerig-backend.onrender.com/api/event/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const res = await axios.get(`https://jugehoerig-backend.onrender.com/api/event/${id}`);
      setEvent(res.data);
      setEditMode(false);
    } catch {
      setSaveError("Fehler beim Speichern des Events.");
    } finally {
      setSaving(false);
    }
  };

  // --- Event löschen ---
  const handleDelete = async () => {
    if (!window.confirm("Möchten Sie dieses Event wirklich löschen?")) return;
    try {
      await axios.delete(
        `https://jugehoerig-backend.onrender.com/api/event/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      navigate("/events");
    } catch {
      alert("Fehler beim Löschen des Events.");
    }
  };

  // --- Anmeldung ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(false);
    try {
      await axios.post(
        `https://jugehoerig-backend.onrender.com/api/event/${id}/anmeldung`,
        { daten: formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setRegisterSuccess(true);
      setFormData(prev => {
        const resetData = { ...prev };
        (event.formular || []).forEach(f => resetData[f.feldname] = "");
        return resetData;
      });
    } catch (err) {
      setRegisterError(err.response?.data?.error || "Fehler bei der Anmeldung.");
    }
  };

  // --- Kalender-Funktionen ---
  const generateICS = (ev) => {
    const start = new Date(ev.von).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(ev.bis).toISOString().replace(/-|:|\.\d+/g, "");
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${ev.titel}
DESCRIPTION:${ev.beschreibung}
LOCATION:${ev.ort}
DTSTART:${start}
DTEND:${end}
END:VEVENT
END:VCALENDAR
    `.trim();
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    return URL.createObjectURL(blob);
  };

  const generateGoogleCalendarLink = (ev) => {
    const start = new Date(ev.von).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(ev.bis).toISOString().replace(/-|:|\.\d+/g, "");
    return `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(ev.titel)}&dates=${start}/${end}&details=${encodeURIComponent(ev.beschreibung)}&location=${encodeURIComponent(ev.ort)}`;
  };

  if (loading) return <p className="loading">Lade Event...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!event) return null;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">&larr; Zurück zur Übersicht</Link>

      <div className="event-header">
        {editMode ? (
          <>
            <input name="titel" value={formData.titel} onChange={handleInputChange} placeholder="Titel" />
            <input type="file" accept="image/png" onChange={handleImageChange} />
          </>
        ) : (
          <>
            <h1>{event.titel}</h1>
            {event.bild && <img src={event.bild} alt={event.bildtitel} className="event-image" />}
          </>
        )}
      </div>

      <div className="event-info">
        {editMode ? (
          <>
            <textarea name="beschreibung" value={formData.beschreibung} onChange={handleInputChange} placeholder="Beschreibung" />
            <input name="ort" value={formData.ort} onChange={handleInputChange} placeholder="Ort" />
            <input type="datetime-local" name="von" value={formData.von} onChange={handleInputChange} />
            <input type="datetime-local" name="bis" value={formData.bis} onChange={handleInputChange} />
            <label><input type="checkbox" name="alle" checked={formData.alle} onChange={handleInputChange} /> Für Alle</label>
            <label><input type="checkbox" name="supporter" checked={formData.supporter} onChange={handleInputChange} /> Supporter Event</label>

            <div className="preise-edit">
              <h3>Preisoptionen</h3>
              {(formData.preise || []).map((p,i) => (
                <div key={i} className="preis-field">
                  <input value={p.preisbeschreibung} onChange={e => handlePreisChange(i,"preisbeschreibung",e.target.value)} placeholder="Beschreibung" />
                  <input type="number" value={p.kosten} onChange={e => handlePreisChange(i,"kosten",e.target.value)} placeholder="Kosten" />
                  <button type="button" onClick={() => removePreis(i)}>Entfernen</button>
                </div>
              ))}
              <button type="button" onClick={addPreis}>Preis hinzufügen</button>
            </div>

            <div className="felder-edit">
              <h3>Formularfelder</h3>
              {(formData.felder || []).map((f,i) => (
                <div key={i} className="feld-field">
                  <input value={f.feldname} onChange={e=>handleFeldChange(i,"feldname",e.target.value)} placeholder="Feldname" />
                  <select value={f.typ} onChange={e=>handleFeldChange(i,"typ",e.target.value)}>
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                  </select>
                  <label>
                    Pflicht <input type="checkbox" checked={f.pflicht} onChange={e=>handleFeldChange(i,"pflicht",e.target.checked)} />
                  </label>
                  <button type="button" onClick={()=>removeFeld(i)}>Entfernen</button>
                </div>
              ))}
              <button type="button" onClick={addFeld}>Feld hinzufügen</button>
            </div>

            <div className="edit-actions">
              <button onClick={handleSave} disabled={saving}>{saving ? "Speichern..." : "Speichern"}</button>
              <button onClick={handleEditToggle}>Abbrechen</button>
              {saveError && <p className="error">{saveError}</p>}
            </div>
          </>
        ) : (
          <>
            <p><strong>Beschreibung:</strong> {event.beschreibung}</p>
            <p><strong>Ort:</strong> {event.ort}</p>
            <p><strong>Von:</strong> {new Date(event.von).toLocaleString()}</p>
            <p><strong>Bis:</strong> {new Date(event.bis).toLocaleString()}</p>
            <p><strong>Für Alle:</strong> {event.alle ? "Ja" : "Nein"}</p>
            <p><strong>Supporter Event:</strong> {event.supporter ? "Ja" : "Nein"}</p>
          </>
        )}
      </div>

      {!editMode && (
        <div className="calendar-buttons">
          <a href={generateICS(event)} download={`${event.titel}.ics`} className="calendar-button">
            <FiCalendar /> Zum Kalender hinzufügen
          </a>
          <a href={generateGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer" className="calendar-button google">
            Google Calendar
          </a>
        </div>
      )}

      {!editMode && (event.formular || []).length > 0 && (
        <div className="event-formular">
          <h2>Anmeldeformular</h2>
          {registerSuccess && <p className="success">Anmeldung erfolgreich!</p>}
          {registerError && <p className="error">{registerError}</p>}
          <form onSubmit={handleRegister}>
            {(event.formular || []).map(f => (
              <div key={f.id} className="formular-field">
                <label>{f.feldname} {f.pflicht && "*"}</label>
                {f.typ === "text" && <input name={f.feldname} value={formData[f.feldname] || ""} onChange={handleInputChange} required={f.pflicht} />}
                {f.typ === "email" && <input type="email" name={f.feldname} value={formData[f.feldname] || ""} onChange={handleInputChange} required={f.pflicht} />}
                {f.typ === "number" && <input type="number" name={f.feldname} value={formData[f.feldname] || ""} onChange={handleInputChange} required={f.pflicht} />}
                {f.typ === "date" && <input type="date" name={f.feldname} value={formData[f.feldname] || ""} onChange={handleInputChange} required={f.pflicht} />}
                {f.typ === "select" && f.optionen && (
                  <select name={f.feldname} value={formData[f.feldname] || ""} onChange={handleInputChange} required={f.pflicht}>
                    <option value="">Bitte auswählen</option>
                    {(f.optionen || []).map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
                  </select>
                )}
              </div>
            ))}
            <button type="submit" className="register-button">Anmelden</button>
          </form>
        </div>
      )}

      {isAdminOrVorstand && !editMode && (
        <div className="event-actions">
          <button className="edit-button" onClick={handleEditToggle}><FiEdit /> Bearbeiten</button>
          <button className="delete-button" onClick={handleDelete}><FiTrash2 /> Löschen</button>
        </div>
      )}
    </div>
  );
}
