import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiExternalLink,
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiPlus,
} from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./Links.scss";

const Links = () => {
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [isAdminOrVorstand, setIsAdminOrVorstand] = useState(false);

  // Section Edit States
  const [editSectionId, setEditSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState("");

  // Link Edit States
  const [editLinkId, setEditLinkId] = useState(null);
  const [editLinkText, setEditLinkText] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");

  // Add Link States
  const [newLinkText, setNewLinkText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [addingLinkToSection, setAddingLinkToSection] = useState(null);

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const roles = decoded.userTypes || [];
        setIsAdminOrVorstand(
          roles.includes("admin") || roles.includes("vorstand")
        );
      } catch {
        setIsAdminOrVorstand(false);
      }
    }
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await axios.get(
        "https://jugehoerig-backend.onrender.com/api/links"
      );
      setSections(res.data);
    } catch (err) {
      console.error("Fehler beim Abrufen der Sections:", err);
    }
  };

  // --- SECTION AKTIONEN ---
  const handleEditSection = (section) => {
    setEditSectionId(section.id);
    setEditSectionTitle(section.subtitle);
  };

  const saveSectionEdit = async () => {
    if (!editSectionTitle) return alert("Titel darf nicht leer sein");
    try {
      await axios.put(
        `https://jugehoerig-backend.onrender.com/api/links/section/title/${editSectionId}`,
        { subtitle: editSectionTitle },
        axiosConfig
      );
      fetchSections();
      setEditSectionId(null);
      setEditSectionTitle("");
    } catch {
      alert("Fehler beim Speichern");
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Möchtest du diese Sektion wirklich löschen?")) return;
    try {
      await axios.delete(
        `https://jugehoerig-backend.onrender.com/api/links/section/${sectionId}`,
        axiosConfig
      );
      setSections(sections.filter((s) => s.id !== sectionId));
    } catch {
      alert("Fehler beim Löschen");
    }
  };

  // --- LINK AKTIONEN ---
  const handleEditLink = (link) => {
    setEditLinkId(link.id);
    setEditLinkText(link.text);
    setEditLinkUrl(link.url);
  };

  const saveLinkEdit = async () => {
    if (!editLinkText || !editLinkUrl)
      return alert("Bitte Text und URL angeben!");
    try {
      await axios.put(
        `https://jugehoerig-backend.onrender.com/api/links/${editLinkId}`,
        { text: editLinkText, url: editLinkUrl },
        axiosConfig
      );
      fetchSections();
      setEditLinkId(null);
      setEditLinkText("");
      setEditLinkUrl("");
    } catch {
      alert("Fehler beim Speichern");
    }
  };

  const handleDeleteLink = async (linkId, sectionId) => {
    if (!window.confirm("Diesen Link wirklich löschen?")) return;
    try {
      await axios.delete(
        `https://jugehoerig-backend.onrender.com/api/links/${linkId}`,
        axiosConfig
      );
      setSections((prevSections) =>
        prevSections.map((s) =>
          s.id === sectionId
            ? { ...s, links: s.links.filter((l) => l.id !== linkId) }
            : s
        )
      );
    } catch {
      alert("Fehler beim Löschen");
    }
  };

  const handleAddLinkToSection = async (sectionId) => {
    if (!newLinkText || !newLinkUrl)
      return alert("Bitte Text und URL angeben!");
    try {
      await axios.post(
        `https://jugehoerig-backend.onrender.com/api/links/section/${sectionId}/link`,
        { text: newLinkText, url: newLinkUrl },
        axiosConfig
      );
      fetchSections();
      setNewLinkText("");
      setNewLinkUrl("");
      setAddingLinkToSection(null);
    } catch {
      alert("Fehler beim Hinzufügen");
    }
  };

  return (
    <div className="links-management">
      <h2>📚 Nützliche Links Verwaltung</h2>

      {isAdminOrVorstand && (
        <div className="top-controls">
          <button
            onClick={() => navigate("/create-link")}
            className="plus-button"
          >
            <FiPlus /> Neue Sektion hinzufügen
          </button>
        </div>
      )}

      {sections.map((section) => (
        <div key={section.id} className="section-block">
          <div className="section-header">
            {editSectionId === section.id ? (
              <>
                <input
                  value={editSectionTitle}
                  onChange={(e) => setEditSectionTitle(e.target.value)}
                  placeholder="Neuer Sektions-Titel"
                />
                <button onClick={saveSectionEdit} title="Speichern">
                  <FiCheck />
                </button>
                <button
                  onClick={() => setEditSectionId(null)}
                  title="Abbrechen"
                >
                  <FiX />
                </button>
              </>
            ) : (
              <>
                <h3>📂 {section.subtitle}</h3>
                {isAdminOrVorstand && (
                  <div className="section-actions">
                    <button
                      onClick={() => handleEditSection(section)}
                      title="Titel bearbeiten"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      title="Sektion löschen"
                    >
                      <FiTrash2 />
                    </button>
                    <button
                      onClick={() => setAddingLinkToSection(section.id)}
                      title="Neuen Link hinzufügen"
                    >
                      <FiPlus />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {addingLinkToSection === section.id && (
            <div className="add-link">
              <input
                placeholder="Link Titel"
                value={newLinkText}
                onChange={(e) => setNewLinkText(e.target.value)}
              />
              <input
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <button
                onClick={() => handleAddLinkToSection(section.id)}
                title="Speichern"
              >
                <FiCheck />
              </button>
              <button
                onClick={() => setAddingLinkToSection(null)}
                title="Abbrechen"
              >
                <FiX />
              </button>
            </div>
          )}

          <ul>
            {section.links.length > 0 ? (
              section.links.map((link) => (
                <li key={link.id}>
                  {editLinkId === link.id ? (
                    <>
                      <input
                        value={editLinkText}
                        onChange={(e) => setEditLinkText(e.target.value)}
                        placeholder="Neuer Linktitel"
                      />
                      <input
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        placeholder="https://..."
                      />
                      <button onClick={saveLinkEdit} title="Speichern">
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => setEditLinkId(null)}
                        title="Abbrechen"
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FiExternalLink /> {link.text}
                      </a>
                      {isAdminOrVorstand && (
                        <div className="link-actions">
                          <button
                            onClick={() => handleEditLink(link)}
                            title="Link bearbeiten"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteLink(link.id, section.id)
                            }
                            title="Link löschen"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))
            ) : (
              <p className="no-links">Keine Links in dieser Sektion</p>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Links;
