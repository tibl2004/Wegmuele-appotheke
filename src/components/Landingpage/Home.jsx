import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.scss';

const Home = () => {
  const [vorstand, setVorstand] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Vorstand
        const vorstandResponse = await axios.get('https://jugehoerig-backend.onrender.com/api/vorstand/public');
        setVorstand(vorstandResponse.data);

        // Home Content
        const homeResponse = await axios.get('https://jugehoerig-backend.onrender.com/api/home');
        setHomeContent(homeResponse.data);

        // Events
        const eventsResponse = await axios.get('https://jugehoerig-backend.onrender.com/api/event');
        const today = new Date();
        const futureEvents = eventsResponse.data.filter(ev => new Date(ev.von) >= today);
        futureEvents.sort((a, b) => new Date(a.von) - new Date(b.von));
        setEvents(futureEvents);

        // Blogs - nur die letzten 4
        const blogsResponse = await axios.get('https://jugehoerig-backend.onrender.com/api/blogs');
        const sortedBlogs = blogsResponse.data
          .sort((a, b) => new Date(b.erstellt_am) - new Date(a.erstellt_am))
          .slice(0, 4); // die 4 neuesten
        setBlogs(sortedBlogs);

      } catch (err) {
        console.error(err);
        setError('Fehler beim Laden der Daten.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Lade Inhalte...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">

      {/* ================= Hero Section ================= */}
      {homeContent && (
        <section className="hero-section">
          <div className="hero-background">
            {homeContent.youtubeLink ? (
              <iframe
                src={`https://www.youtube.com/embed/${homeContent.youtubeLink.split("v=")[1]}?autoplay=1&mute=1&loop=1&playlist=${homeContent.youtubeLink.split("v=")[1]}&controls=0&modestbranding=1&showinfo=0&rel=0`}
                title="Home Video"
                frameBorder="0"
                allow="autoplay; encrypted-media; clipboard-write; picture-in-picture"
                allowFullScreen
                className="hero-video"
              />
            ) : homeContent.bild ? (
              <img
                src={`data:image/png;base64,${homeContent.bild}`}
                alt="Willkommen"
                className="hero-image"
              />
            ) : null}
            <div className="hero-overlay" />
          </div>

          <div className="hero-content">
            <h1>{homeContent.willkommenText}</h1>
            <a
              href={homeContent.willkommenLink}
              className="hero-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              Über Uns
            </a>
          </div>
        </section>
      )}

      {/* ================= Blogs ================= */}
      <section className="blogs-section">
        <h1>Neueste Blogeinträge</h1>
        {blogs.length === 0 ? (
          <p>Zurzeit sind keine Blogeinträge vorhanden.</p>
        ) : (
          <div className="blogs-grid">
            {blogs.map(blog => (
              <div className="blogs-card" key={blog.id}>
                {blog.bild && (
                  <img
                    src={blog.bild}
                    alt={blog.titel}
                    className="blogs-image"
                  />
                )}
                <div className="blogs-info">
                  <h2>{blog.titel}</h2>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ================= Vorstand ================= */}
      <section className="vorstand-section">
        <h1>Unser Vorstand</h1>
        <div className="vorstand-grid">
          {vorstand.map((mitglied, index) => (
            <div className="vorstand-card" key={index}>
              {mitglied.foto ? (
                <img
                  src={`data:image/jpeg;base64,${mitglied.foto}`}
                  alt={`${mitglied.vorname} ${mitglied.nachname}`}
                  className="vorstand-foto"
                />
              ) : (
                <div className="placeholder-foto">Kein Foto</div>
              )}
              <p className="rolle">{mitglied.rolle}</p>
              <div className="vorstand-info">
                <h2>{mitglied.vorname} {mitglied.nachname}</h2>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
