import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.scss';

const Home = () => {
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVorstand = async () => {
      try {
        const response = await axios.get('https://jugehoerig-backend.onrender.com/api/vorstand/public');
        setVorstand(response.data);
      } catch (err) {
        setError('Fehler beim Laden der Vorstandsdaten.');
      } finally {
        setLoading(false);
      }
    };

    fetchVorstand();
  }, []);

  if (loading) return <div className="loading">Lade Vorstandsdaten...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="home-container">
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
    </div>
  );
};

export default Home;
