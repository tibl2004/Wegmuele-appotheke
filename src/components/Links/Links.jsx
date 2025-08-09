import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Links.scss';
import { FiExternalLink, FiEdit, FiTrash2, FiCheck, FiX, FiPlus } from 'react-icons/fi';
import {jwtDecode} from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Links = () => {
  const [sections, setSections] = useState([]);
  const [isVorstandOrAdmin, setIsVorstandOrAdmin] = useState(false);
  const [editSectionId, setEditSectionId] = useState(null);
  const [editLinkId, setEditLinkId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.userTypes && Array.isArray(decoded.userTypes)) {
          const hasAccess = decoded.userTypes.includes('admin') || decoded.userTypes.includes('vorstand');
          setIsVorstandOrAdmin(hasAccess);
        } else {
          setIsVorstandOrAdmin(false);
        }
      } catch (err) {
        setIsVorstandOrAdmin(false);
      }
    } else {
      setIsVorstandOrAdmin(false);
    }
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await axios.get('https://jugehoerig-backend.onrender.com/api/links');
      setSections(res.data);
    } catch (error) {
      console.error('Fehler beim Abrufen der Links:', error);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Willst du diesen Abschnitt wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://jugehoerig-backend.onrender.com/api/links/${sectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(sections.filter(s => s.id !== sectionId));
    } catch (error) {
      alert('Löschen fehlgeschlagen.');
    }
  };

  const handleDeleteLink = async (linkId, sectionId) => {
    if (!window.confirm('Willst du diesen Link wirklich löschen?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://jugehoerig-backend.onrender.com/api/links/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSections(sections.map(section =>
        section.id === sectionId
          ? { ...section, links: section.links.filter(link => link.id !== linkId) }
          : section
      ));
    } catch (error) {
      alert('Löschen fehlgeschlagen.');
    }
  };

  const handleEditSection = (section) => {
    setEditSectionId(section.id);
    setEditValue(section.subtitle);
    setEditLinkId(null);
  };

  const handleEditLink = (link) => {
    setEditLinkId(link.id);
    setEditValue(link.text);
    setEditUrl(link.url);
    setEditSectionId(null);
  };

  const saveSectionEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://jugehoerig-backend.onrender.com/api/links/${editSectionId}`, { subtitle: editValue }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSections();
      setEditSectionId(null);
      setEditValue('');
    } catch (error) {
      alert('Speichern fehlgeschlagen.');
    }
  };

  const saveLinkEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://jugehoerig-backend.onrender.com/api/links/${editLinkId}`, { text: editValue, url: editUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSections();
      setEditLinkId(null);
      setEditValue('');
      setEditUrl('');
    } catch (error) {
      alert('Speichern fehlgeschlagen.');
    }
  };

  return (
    <div className="links-wrapper">
      <div className="header-with-button">
        <h2>Nützliche Links</h2>
        {isVorstandOrAdmin && (
          <button
            onClick={() => navigate('/create-link')}
            className="plus-button"
            title="Neue Sektion hinzufügen"
          >
            <FiPlus size={20} />
          </button>
        )}
      </div>
      <p>Hier findest du nützliche Links:</p>

      {sections.map((section) => (
        <div key={section.id} className="section-block">
          <div className="section-header">
            {editSectionId === section.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
                <button onClick={saveSectionEdit}><FiCheck /></button>
                <button onClick={() => setEditSectionId(null)}><FiX /></button>
              </>
            ) : (
              <>
                <h3>{section.subtitle}</h3>
                {isVorstandOrAdmin && (
                  <>
                    <button onClick={() => handleEditSection(section)} className="icon-button" title="Abschnitt bearbeiten">
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="icon-button delete-button"
                      title="Abschnitt löschen"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          <ul>
            {section.links.map((link) => (
              <li key={link.id}>
                {editLinkId === link.id ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Link-Text"
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="Link-URL"
                    />
                    <button onClick={saveLinkEdit} title="Link speichern"><FiCheck /></button>
                    <button onClick={() => setEditLinkId(null)} title="Abbrechen"><FiX /></button>
                  </>
                ) : (
                  <>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <FiExternalLink className="link-icon" />
                      {link.text}
                    </a>
                    {isVorstandOrAdmin && (
                      <>
                        <button onClick={() => handleEditLink(link)} className="icon-button" title="Link bearbeiten">
                          <FiEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id, section.id)}
                          className="icon-button delete-button"
                          title="Link löschen"
                        >
                          <FiTrash2 />
                        </button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Links;
