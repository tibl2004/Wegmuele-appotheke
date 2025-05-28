import React, { useEffect, useState } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";  // korrigierter Import
import "./UeberUns.scss";

function UeberUns() {
  const [vorstand, setVorstand] = useState([]);
  const [video, setVideo] = useState(null);
  const [loadingVorstand, setLoadingVorstand] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editLink, setEditLink] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        jwtDecode(token);
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }

    const fetchVorstand = async () => {
      try {
        const response = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/vorstand/public"
        );
        setVorstand(response.data);
      } catch (error) {
        console.error("Fehler beim Laden des Vorstands:", error);
      } finally {
        setLoadingVorstand(false);
      }
    };

    const fetchVideo = async () => {
      try {
        const response = await axios.get(
          "https://jugehoerig-backend.onrender.com/api/youtubelink"
        );
        setVideo(response.data);
        if (response.data && response.data.link) setEditLink(response.data.link);
      } catch (error) {
        console.error("Fehler beim Laden des Videos:", error);
        setVideo(null);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVorstand();
    fetchVideo();
  }, []);

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const saveEditedLink = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://jugehoerig-backend.onrender.com/api/youtubelink",
        { youtubelink: editLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      const response = await axios.get(
        "https://jugehoerig-backend.onrender.com/api/youtubelink"
      );
      setVideo(response.data);
    } catch (error) {
      alert("Fehler beim Speichern des Links!");
      console.error(error);
    }
  };

  if (loadingVorstand || loadingVideos) return <p>Lade Inhalte...</p>;

  return (
    <div className="ueberuns-container">
      {/* Titel + Bearbeiten-Button nebeneinander */}
      <div className="ueberuns-header">
        <h1>Über uns</h1>
        {isLoggedIn && (
          <div className="edit-button-container-header">
            {editing ? (
              <>
                <input
                  type="text"
                  value={editLink}
                  onChange={(e) => setEditLink(e.target.value)}
                  className="edit-link-input"
                />
                <button onClick={saveEditedLink} className="save-button">
                  Speichern
                </button>
                <button onClick={() => setEditing(false)} className="cancel-button">
                  Abbrechen
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="edit-button">
                Bearbeiten
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video-Bereich */}
      <div className="video-frame-container">
        {!editing && video && video.link ? (() => {
          const videoId = extractVideoId(video.link);
          if (!videoId) return <p>Ungültiger YouTube-Link.</p>;
          return (
            <iframe
              key={video.id}
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ marginBottom: "1rem", position: "relative" }}
            />
          );
        })() : null}

        {!editing && (!video || !video.link) && (
          <p>Kein Video verfügbar.</p>
        )}
      </div>

      {/* Vorstand-Bereich */}
      <div className="vorstand-container">
        <h2 className="vorstand-title">Unser Vorstand</h2>

        {vorstand.length === 0 ? (
          <p className="vorstand-empty">Keine Daten gefunden.</p>
        ) : (
          <div className="vorstand-grid">
            {vorstand.map((mitglied, index) => (
              <div className="vorstand-card" key={index}>
                <div className="vorstand-image-wrapper">
                  {mitglied.foto && (
                    <img
                      src={`data:image/png;base64,${mitglied.foto}`}
                      alt={`Foto von ${mitglied.vorname} ${mitglied.nachname}`}
                      className="vorstand-foto"
                    />
                  )}
                  <div className="vorstand-rolle-overlay">{mitglied.rolle}</div>
                </div>
                <div className="vorstand-info">
                  <h3 className="vorstand-name">
                    {mitglied.vorname} {mitglied.nachname}
                  </h3>
                  <p className="vorstand-beschreibung">{mitglied.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UeberUns;
