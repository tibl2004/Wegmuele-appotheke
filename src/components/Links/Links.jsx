import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Links.scss';
import { FiExternalLink } from 'react-icons/fi';
import {jwtDecode} from 'jwt-decode';
import { Link } from "react-router-dom";

const Links = () => {
  const [sections, setSections] = useState([]);
  const [isVorstand, setIsVorstand] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
if (token) {
  try {
    const decoded = jwtDecode(token);
    if (decoded.userType === 'vorstand' || decoded.userType === 'admin') {
      setIsVorstand(true);
    }
  } catch (err) {
    console.error("Fehler beim Dekodieren des Tokens:", err);
  }
}


    const fetchSections = async () => {
      try {
        const res = await axios.get('https://jugehoerig-backend.onrender.com/api/links');
        setSections(res.data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Inhalte:', error);
      }
    };

    fetchSections();
  }, []);

  return (
    <div className="links-wrapper">
      <div className="header-with-button">
        <h2>Nützliche Links</h2>
        {isVorstand && (
       <Link to="/create-link" className="plus-button" title="Link hinzufügen">
       +
     </Link>
     
        )}
      </div>
      <p>Hier findest du nützliche Links:</p>
      {sections.map((section) => (
        <div key={section.id} className="section-block">
          <h3>{section.subtitle}</h3>
          <ul>
            {section.links.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <FiExternalLink className="link-icon" />
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Links;
