import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Links.scss';
import { FiExternalLink } from 'react-icons/fi';

const Links = () => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
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
      <h2>Nützliche Links</h2>
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
