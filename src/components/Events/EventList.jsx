import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventList.scss";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTypes, setUserTypes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://jugehoerig-backend.onrender.com/api/event")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden der Events");
        setLoading(false);
      });

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.userTypes) {
      setUserTypes(storedUser.userTypes);
    }
  }, []);

  const handleCreateNewClick = () => {
    navigate("/event/create");
  };

  // ⚡ Bearbeiten -> navigiert in EventDetail direkt mit Edit-Mode
  const handleEditClick = (id) => {
    navigate(`/event/${id}`, { state: { edit: true } });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Willst du dieses Event wirklich löschen?")) return;
    try {
      await axios.delete(`https://jugehoerig-backend.onrender.com/api/event/${id}`);
      setEvents((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      alert("Fehler beim Löschen des Events");
    }
  };

  const canCreateEvent =
    userTypes.includes("admin") || userTypes.includes("vorstand");

  if (loading) return <p className="loading">Lade Events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="event-list">
      <div className="header-row">
        <h1>Events Übersicht</h1>
        {canCreateEvent && (
          <button
            className="create-button"
            onClick={handleCreateNewClick}
            aria-label="Neues Event erstellen"
            title="Neues Event erstellen"
          >
            <Plus size={20} /> Neues Event
          </button>
        )}
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="event-card">
              {event.bild && (
                <div className="event-image">
                  <img src={event.bild} alt={event.titel} loading="lazy" />
                </div>
              )}
              <div className="event-content">
                <h2>{event.titel}</h2>
                <p>
                  {event.beschreibung.substring(0, 100)}
                  {event.beschreibung.length > 100 ? "..." : ""}
                </p>
              </div>
              {canCreateEvent && (
                <div className="event-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditClick(event.id)}
                  >
                    <Pencil size={16} /> Bearbeiten
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteClick(event.id)}
                  >
                    <Trash2 size={16} /> Löschen
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
