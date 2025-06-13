import React, { useEffect, useState } from "react";
import axios from "axios";
import "./EventDetail.scss";
import { useParams, Link } from "react-router-dom";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`https://jugehoerig-backend.onrender.com/api/event/${id}`)
      .then((res) => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Event konnte nicht geladen werden");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="loading">Lade Event...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!event) return null;

  return (
    <div className="event-detail">
      <Link to="/events" className="back-link">
        &larr; Zurück zur Übersicht
      </Link>

      <div className="event-header">
        <h1>{event.titel}</h1>
        {event.bild && <img src={event.bild} alt={event.titel} />}
      </div>

      <div className="event-info">
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
      </div>
    </div>
  );
}
