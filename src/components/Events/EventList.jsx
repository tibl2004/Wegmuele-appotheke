import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import {jwtDecode} from "jwt-decode";
import { useNavigate, Link } from "react-router-dom";
import "./EventList.scss";

export default function EventList() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminOrVorstand, setIsAdminOrVorstand] = useState(false);

  const [editEventId, setEditEventId] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  useEffect(() => {
    // UserType aus Token prüfen
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded.userTypes || [];
        setIsAdminOrVorstand(roles.includes("admin") || roles.includes("vorstand"));
      } catch {
        setIsAdminOrVorstand(false);
      }
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("https://jugehoerig-backend.onrender.com/api/event", axiosConfig);
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Events:", err);
      setError("Fehler beim Laden der Events");
      setLoading(false);
    }
  };

  const handleCreateNewClick = () => {
    navigate("/event/create");
  };

  const handleEditClick = (id) => {
    navigate(`/event/${id}`, { state: { edit: true } });
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Willst du dieses Event wirklich löschen?")) return;
    try {
      await axios.delete(`https://jugehoerig-backend.onrender.com/api/event/${id}`, axiosConfig);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert("Fehler beim Löschen des Events");
    }
  };

  if (loading) return <p className="loading">Lade Events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="event-list">
      <div className="header-row">
        <h1>Events Übersicht</h1>
        {isAdminOrVorstand && (
          <button className="plus-button" onClick={handleCreateNewClick} title="Neues Event erstellen">
            <FiPlus size={20} /> Neues Event
          </button>
        )}
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">Keine Events vorhanden</p>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card-wrapper">
              <Link to={`/event/${event.id}`} className="event-card-link">
                <div className="event-card">
                  {event.bild && (
                    <div className="event-image">
                      <img src={event.bild} alt={event.titel} loading="lazy" />
                    </div>
                  )}
                  <div className="event-content">
                    <h2>{event.titel}</h2>
                    <p>{event.beschreibung.length > 100 ? event.beschreibung.substring(0, 100) + "..." : event.beschreibung}</p>
                  </div>
                </div>
              </Link>

              {isAdminOrVorstand && (
                <div className="event-actions">
                  <button className="edit-button" onClick={() => handleEditClick(event.id)}>
                    <FiEdit /> Bearbeiten
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteClick(event.id)}>
                    <FiTrash2 /> Löschen
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
