import React, { useState } from "react";
import axios from "axios";
import {
  FiFacebook, FiInstagram, FiTwitter, FiMail, FiLinkedin, FiYoutube,
  FiGithub, FiGlobe, FiPhone
} from "react-icons/fi";
import "./ImpressumCreate.scss";

const iconOptions = [
  { name: "Facebook", component: <FiFacebook /> },
  { name: "Instagram", component: <FiInstagram /> },
  { name: "Twitter", component: <FiTwitter /> },
  { name: "E-Mail", component: <FiMail /> },
  { name: "LinkedIn", component: <FiLinkedin /> },
  { name: "YouTube", component: <FiYoutube /> },
  { name: "GitHub", component: <FiGithub /> },
  { name: "Website", component: <FiGlobe /> },
  { name: "Telefon", component: <FiPhone /> },
];

const ImpressumCreate = () => {
  const [impressumData, setImpressumData] = useState({
    title: "",
    text: "",
    adresse: "",
  });

  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ title: "", url: "", icon: iconOptions[0].name });
  const [loading, setLoading] = useState(false);

  const handleImpressumChange = (e) => {
    setImpressumData({ ...impressumData, [e.target.name]: e.target.value });
  };

  const handleNewLinkChange = (e) => {
    setNewLink({ ...newLink, [e.target.name]: e.target.value });
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url || !newLink.icon) return alert("Alle Felder sind Pflicht!");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://jugehoerig-backend.onrender.com/api/impressumlinks/create",
        newLink,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setLinks([...links, newLink]);
      setNewLink({ title: "", url: "", icon: iconOptions[0].name });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Erstellen des Links.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://jugehoerig-backend.onrender.com/api/impressum",
        impressumData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setImpressumData({ title: "", text: "", adresse: "" });
      setLinks([]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Fehler beim Erstellen des Impressums.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="impressum-create">
      <h2>Impressum erstellen</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Titel</label>
          <input
            type="text"
            name="title"
            value={impressumData.title}
            onChange={handleImpressumChange}
            placeholder="Titel des Impressums"
            required
          />
        </div>

        <div className="form-group">
          <label>Text</label>
          <textarea
            name="text"
            value={impressumData.text}
            onChange={handleImpressumChange}
            placeholder="Beschreiben Sie das Impressum"
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label>Adresse</label>
          <input
            type="text"
            name="adresse"
            value={impressumData.adresse}
            onChange={handleImpressumChange}
            placeholder="Adresse eintragen"
            required
          />
        </div>

        <hr />

        <h3>Custom Links hinzufügen</h3>
        <div className="form-group-inline">
          <input
            type="text"
            name="title"
            value={newLink.title}
            onChange={handleNewLinkChange}
            placeholder="Titel (z.B. Facebook)"
            required
          />
          <input
            type="url"
            name="url"
            value={newLink.url}
            onChange={handleNewLinkChange}
            placeholder="Link (z.B. https://facebook.com oder E-Mail)"
            required
          />
          <select name="icon" value={newLink.icon} onChange={handleNewLinkChange}>
            {iconOptions.map((icon) => (
              <option key={icon.name} value={icon.name}>{icon.name}</option>
            ))}
          </select>
          <button type="button" onClick={addLink}>Hinzufügen</button>
        </div>

        <ul className="links-list">
          {links.map((link, index) => {
            const iconComponent = iconOptions.find((i) => i.name === link.icon)?.component;
            const href = link.icon === "E-Mail" ? `mailto:${link.url}` : link.url;
            const target = link.icon === "E-Mail" ? "_self" : "_blank";
            const rel = link.icon === "E-Mail" ? undefined : "noopener noreferrer";

            return (
              <li key={index}>
                {iconComponent} {link.title} - <a href={href} target={target} rel={rel}>{link.url}</a>
              </li>
            );
          })}
        </ul>

        <button type="submit" disabled={loading}>
          {loading ? "Speichern..." : "Impressum erstellen"}
        </button>
      </form>
    </div>
  );
};

export default ImpressumCreate;
