import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventDetail.scss";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Startet im Edit-Mode, wenn aus EventList mit { state: { edit: true } } aufgerufen
  const [editMode, setEditMode] = useState(location.state?.edit === true);

  const [formData, setFormData] = useState({
    titel: "",
    beschreibung: "",
    ort: "",
    von: "",
    bis: "",
    alle: false,
    supporter: false,
    bild: null,
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [userTypes, setUserTypes] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.userTypes) {
          setUserTypes(parsedUser.userTypes.toLowerCase());
        }
      } catch {
        console.error("Fehler beim Parsen der Benutzerdaten");
      }
    }

    axios
      .get(`https://jugehoerig-backend.onrender.com/api/event/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setEvent(res.data);
        setFormData({
          titel: res.data.titel || "",
          beschreibung: res.data.beschreibung || "",
          ort: res.data.ort || "",
          von: res.data.von
            ? new Date(res.data.von).toISOString().slice(0, 16)
            : "",
          bis: res.data.bis
            ? new Date(res.data.bis).toISOString().slice(0, 16)
            : "",
          alle: res.data.alle === 1 || res.data.alle === true,
          supporter: res.data.supporter === 1 || res.data.supporter === true,
          bild: null,
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Event konnte nicht geladen werden");
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          bild: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Bitte nur PNG-Dateien hochladen.");
      e.target.value = null;
    }
  };

  const handleEditToggle = () => {
    setEditMode((prev) => !prev);
    setSaveError(null);
    if (editMode && event) {
      setFormData({
        titel: event.titel || "",
        beschreibung: event.beschreibung || "",
        ort: event.ort || "",
        von: event.von ? new Date(event.von).toISOString().slice(0, 16) : "",
        bis: event.bis ? new Date(event.bis).toISOString().slice(0, 16) : "",
        alle: event.alle === 1 || event.alle === true,
        supporter: event.supporter === 1 || event.supporter === true,
        bild: null,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        titel: formData.titel,
        beschreibung: formData.beschreibung,
        ort: formData.ort,
        von: formData.von,
        bis: formData.bis,
        alle: formData.alle,
        supporter: formData.supporter,
      };
      if (formData.bild) {
        payload.bild = formData.bild;
      }

      await axios.put(
        `https://jugehoerig-backend.onrender.com/api/event/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const res = await axios.get(
        `https://jugehoerig-backend.onrender.com/api/event/${id}`
      );
      setEvent(res.data);
      setEditMode(false);
    } catch {
      setSaveError("Fehler beim Speichern des Events.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Möchten Sie dieses Event wirklich löschen?")) return;
    try {
      await axios.delete(
        `https://jugehoerig-backend.onrender.com/api/event/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      navigate("/events");
    } catch {
      alert("Fehler beim Löschen des Events.");
    }
  };

  if (loading) return <p className="loading">Lade Event...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!event) return null;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">
        &larr; Zurück zur Übersicht
      </Link>

      <div className="event-header">
        {!editMode ? (
          <h1>{event.titel}</h1>
        ) : (
          <>
            <input
              type="text"
              name="titel"
              value={formData.titel}
              onChange={handleInputChange}
              placeholder="Titel"
              required
            />
            <input type="file" accept="image/png" onChange={handleImageChange} />
            {(formData.bild || event.bild) && (
              <img
                src={
                  formData.bild
                    ? formData.bild
                    : `data:image/png;base64,${event.bild}`
                }
                alt="Event Vorschau"
                style={{ maxWidth: "400px", marginTop: "10px" }}
              />
            )}
          </>
        )}
      </div>

      <div className="event-info">
        {!editMode ? (
          <>
            <img src={event.bild} alt={event.bildtitel} />
            <p>
              <strong>Beschreibung:</strong> {event.beschreibung}
            </p>
            <p>
              <strong>Ort:</strong> {event.ort}
            </p>
            <p>
              <strong>Von:</strong> {new Date(event.von).toLocaleString()}
            </p>
            <p>
              <strong>Bis:</strong> {new Date(event.bis).toLocaleString()}
            </p>
            <p>
              <strong>Für Alle:</strong> {event.alle ? "Ja" : "Nein"}
            </p>
            <p>
              <strong>Supporter Event:</strong> {event.supporter ? "Ja" : "Nein"}
            </p>
          </>
        ) : (
          <>
            <label>
              Beschreibung:
              <textarea
                name="beschreibung"
                value={formData.beschreibung}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </label>
            <label>
              Ort:
              <input
                type="text"
                name="ort"
                value={formData.ort}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Von:
              <input
                type="datetime-local"
                name="von"
                value={formData.von}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Bis:
              <input
                type="datetime-local"
                name="bis"
                value={formData.bis}
                onChange={handleInputChange}
                required
              />
            </label>
            <label>
              Für Alle:
              <input
                type="checkbox"
                name="alle"
                checked={formData.alle}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Supporter Event:
              <input
                type="checkbox"
                name="supporter"
                checked={formData.supporter}
                onChange={handleInputChange}
              />
            </label>
          </>
        )}
      </div>

      <div className="event-actions">
        {editMode ? (
          <>
            <button onClick={handleSave} disabled={saving}>
              {saving ? "Speichert..." : "Speichern"}
            </button>
            <button onClick={handleEditToggle} disabled={saving}>
              Abbrechen
            </button>
            {saveError && <p className="error">{saveError}</p>}
          </>
        ) : (
          <>
            {(userTypes === "admin" || userTypes === "vorstand") && (
              <button onClick={handleEditToggle}>Bearbeiten</button>
            )}
            {userTypes === "admin" && (
              <button
                onClick={handleDelete}
                style={{ backgroundColor: "red", color: "#fff" }}
              >
                Löschen
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
