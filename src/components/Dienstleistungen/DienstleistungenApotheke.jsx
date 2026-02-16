import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // <- Import Link
import axios from "axios";
import "./DienstleistungenApotheke.scss";

const DIENSTLEISTUNGEN_API = "https://wegm-hle-apotheke-backend.onrender.com/api/dienstleistungen";

export default function DienstleistungenApotheke() {
  const [dienstleistungen, setDienstleistungen] = useState([]);

  useEffect(() => {
    const loadDienstleistungen = async () => {
      try {
        const res = await axios.get(DIENSTLEISTUNGEN_API);
        setDienstleistungen(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadDienstleistungen();
  }, []);

  return (
    <div className="dienstleistungen-apotheke">
      <h1>🩺 Unsere Dienstleistungen</h1>
      <div className="grid">
        {dienstleistungen.map(d => (
          <Link
            to={`/dienstleistung/${d.id}`} // <- hier geht’s zum Detail
            key={d.id}
            className="card-link"
          >
            <div className="card">
              <div className="card-inner open-inward">
                <img
                  src={`https://wegm-hle-apotheke-backend.onrender.com/uploads/dienstleistungen/${d.bild}`}
                  alt={d.titel}
                />
                <h3>{d.titel}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
