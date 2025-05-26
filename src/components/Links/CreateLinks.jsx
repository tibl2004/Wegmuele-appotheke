import React, { useState } from 'react';
import axios from 'axios';
import './CreateLinks.scss';
import { FiLink, FiTrash, FiPlusCircle, FiSave } from 'react-icons/fi';

const CreateLinks = () => {
  const [subtitle, setSubtitle] = useState('');
  const [links, setLinks] = useState([{ text: '', url: '' }]);

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  const addLink = () => setLinks([...links, { text: '', url: '' }]);

  const removeLink = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://jugehoerig-backend.onrender.com/api/links', { subtitle, links });
      setSubtitle('');
      setLinks([{ text: '', url: '' }]);
    } catch (error) {
      console.error('Fehler beim Erstellen:', error);
      alert('Fehler beim Erstellen des Inhalts.');
    }
  };
  

  return (
    <div className="create-links-container">
      <h2><FiLink /> Neue Sektion mit Links</h2>
      <form onSubmit={handleSubmit} className="create-links-form">
        <div className="form-group">
          <label>Untertitel:</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            required
            placeholder="Gib einen Untertitel ein"
          />
        </div>

        <div className="links-section">
          <h4>Links</h4>
          {links.map((link, index) => (
            <div key={index} className="link-input-row">
              <input
                type="text"
                placeholder="Link Text"
                value={link.text}
                onChange={(e) => handleLinkChange(index, 'text', e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="Link URL"
                value={link.url}
                onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                required
              />
              {links.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeLink(index)}
                >
                  <FiTrash />
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={addLink}>
            <FiPlusCircle /> Link hinzufügen
          </button>
        </div>

        <button type="submit" className="submit-btn">
          <FiSave /> Erstellen
        </button>
      </form>
    </div>
  );
};

export default CreateLinks;
