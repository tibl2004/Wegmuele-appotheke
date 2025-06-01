import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventStyles.scss";
import { Link } from "react-router-dom";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/events")
      .then((res) => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden der Events");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="loading">Lade Events...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="event-list">
      <h1>Events Übersicht</h1>
      <div className="events-grid">
        {events.map((event) => (
          <Link key={event.id} to={`/events/${event.id}`} className="event-card">
            {event.bild && (
              <div className="event-image">
                <img src={event.bild} alt={event.titel} loading="lazy" />
              </div>
            )}
            <div className="event-content">
              <h2>{event.titel}</h2>
              <p>{event.beschreibung.substring(0, 100)}...</p>
              <p className="event-info">
                <strong>Ort:</strong> {event.ort} |{" "}
                <strong>Von:</strong> {new Date(event.von).toLocaleDateString()}{" "}
                <strong>Bis:</strong> {new Date(event.bis).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
