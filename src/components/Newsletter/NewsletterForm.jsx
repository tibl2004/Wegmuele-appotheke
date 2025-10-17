import React, { useState } from 'react';
import axios from 'axios';
import './NewsletterForm.scss';

const NewsletterForm = () => {
  const [title, setTitle] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sections, setSections] = useState([{ subtitle: '', text: '', foto: '', link: '' }]);
  const [message, setMessage] = useState('');

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addSection = () => setSections([...sections, { subtitle: '', text: '', foto: '', link: '' }]);
  const removeSection = (index) => setSections(sections.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !sendDate) {
      setMessage('Titel und Versanddatum sind erforderlich.');
      return;
    }
    if (sections.length === 0) {
      setMessage('Mindestens eine Sektion ist erforderlich.');
      return;
    }

    try {
      const payload = { title, send_date: sendDate, sections };
      const response = await axios.post('/api/newsletter/create', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setMessage(`Newsletter erfolgreich erstellt! ID: ${response.data.newsletterId}`);
      setTitle('');
      setSendDate('');
      setSections([{ subtitle: '', text: '', foto: '', link: '' }]);
    } catch (err) {
      setMessage('Fehler beim Erstellen: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="newsletter-container">
      <h1>Newsletter erstellen</h1>
      {message && <div className="newsletter-message">{message}</div>}

      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label>
          Titel:
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
        </label>

        <label>
          Versanddatum:
          <input type="date" value={sendDate} onChange={e => setSendDate(e.target.value)} required />
        </label>

        <h2>Abschnitte</h2>
        {sections.map((sec, idx) => (
          <div className="newsletter-section" key={idx}>
            <label>
              Untertitel:
              <input type="text" value={sec.subtitle} onChange={e => handleSectionChange(idx, 'subtitle', e.target.value)} />
            </label>

            <label>
              Text:
              <textarea value={sec.text} rows={4} onChange={e => handleSectionChange(idx, 'text', e.target.value)} />
            </label>

            <label>
              Foto (Base64):
              <textarea value={sec.foto} rows={2} onChange={e => handleSectionChange(idx, 'foto', e.target.value)} />
            </label>

            <label>
              Link:
              <input type="url" value={sec.link} onChange={e => handleSectionChange(idx, 'link', e.target.value)} />
            </label>

            <button type="button" onClick={() => removeSection(idx)} disabled={sections.length === 1}>
              Abschnitt entfernen
            </button>
          </div>
        ))}

        <button type="button" onClick={addSection}>Abschnitt hinzufügen</button>
        <button type="submit">Newsletter erstellen</button>
      </form>

      <h2>Vorschau</h2>
      {sections.map((sec, idx) => (
        <div className="newsletter-preview" key={idx}>
          <h3>{sec.subtitle || '(Kein Untertitel)'}</h3>
          <p>{sec.text}</p>
          {sec.link && <a href={sec.link} target="_blank" rel="noopener noreferrer">{sec.link}</a>}
          {sec.foto && <img src={sec.foto} alt={`Foto Abschnitt ${idx + 1}`} />}
        </div>
      ))}
    </div>
  );
};

export default NewsletterForm;
