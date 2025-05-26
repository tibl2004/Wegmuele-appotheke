import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { events } from './EventView';
import './EventDetail.scss';

const EventDetail = () => {
  const { title } = useParams();
  const navigate = useNavigate();

  // Suche Event anhand des Titels (URL-Decodiert)
  const event = events.find(e => e.title === decodeURIComponent(title));

  if (!event) {
    return (
      <div>
        <p>Event nicht gefunden!</p>
        <button onClick={() => navigate(-1)}>Zurück</button>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>← Zurück</button>
      <img
        src={`data:image/jpeg;base64,${event.imageBase64}`}
        alt={event.title}
        className="detail-image"
      />
      <div className="detail-content">
        <h2 className="detail-title">{event.title}</h2>
        <p className="detail-location">{event.location}</p>
        <p className="detail-date">
          {new Date(event.dateFrom).toLocaleString()} – {new Date(event.dateTo).toLocaleString()}
        </p>
        <p className="detail-description">{event.description}</p>
        {event.supportedBy && (
          <p className="detail-supported">Unterstützt durch {event.supportedBy}</p>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
