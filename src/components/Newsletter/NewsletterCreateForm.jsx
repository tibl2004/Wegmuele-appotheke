import React, { useState } from 'react';
import axios from 'axios';

function NewsletterForm() {
  const [title, setTitle] = useState('');
  const [sendDate, setSendDate] = useState('');
  const [sections, setSections] = useState([
    { subtitle: '', text: '', foto: '', link: '' }
  ]);
  const [message, setMessage] = useState('');

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { subtitle: '', text: '', foto: '', link: '' }]);
  };

  const removeSection = (index) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title || !sendDate) {
      setMessage('Titel und Versanddatum sind erforderlich');
      return;
    }
    if (sections.length === 0) {
      setMessage('Mindestens eine Sektion ist erforderlich');
      return;
    }

    try {
      const payload = {
        title,
        send_date: sendDate,
        sections
      };

      const response = await axios.post('/api/newsletter/create', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessage('Newsletter erfolgreich erstellt! ID: ' + response.data.newsletterId);

      // Reset form
      setTitle('');
      setSendDate('');
      setSections([{ subtitle: '', text: '', foto: '', link: '' }]);
    } catch (error) {
      setMessage('Fehler beim Erstellen des Newsletters: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="newsletter-form">
      <h2>Neuen Newsletter erstellen</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Titel:
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </label>

        <label>
          Versanddatum:
          <input
            type="date"
            value={sendDate}
            onChange={e => setSendDate(e.target.value)}
            required
          />
        </label>

        <h3>Abschnitte</h3>
        {sections.map((section, idx) => (
          <div key={idx} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
            <label>
              Untertitel:
              <input
                type="text"
                value={section.subtitle}
                onChange={e => handleSectionChange(idx, 'subtitle', e.target.value)}
              />
            </label>

            <label>
              Text:
              <textarea
                rows={3}
                value={section.text}
                onChange={e => handleSectionChange(idx, 'text', e.target.value)}
                placeholder="Hier Text eingeben. Links werden unten separat eingegeben."
              />
            </label>

            <label>
              Foto (Base64 mit prefix, z.B. data:image/png;base64,...):
              <textarea
                rows={2}
                value={section.foto}
                onChange={e => handleSectionChange(idx, 'foto', e.target.value)}
                placeholder="Base64-Bild hier einfügen"
              />
            </label>

            <label>
              Link (wird als klickbarer Text im Abschnitt dargestellt):
              <input
                type="url"
                value={section.link}
                onChange={e => handleSectionChange(idx, 'link', e.target.value)}
                placeholder="https://example.com"
              />
            </label>

            <button type="button" onClick={() => removeSection(idx)} disabled={sections.length === 1}>
              Abschnitt entfernen
            </button>
          </div>
        ))}

        <button type="button" onClick={addSection}>Abschnitt hinzufügen</button>
        <br />
        <button type="submit">Newsletter erstellen</button>
      </form>

      <hr />

      <h2>Vorschau der Abschnitte</h2>
      {sections.map((section, idx) => (
        <div key={idx} style={{ border: '1px solid #aaa', marginBottom: 10, padding: 10 }}>
          <h4>{section.subtitle || '(Kein Untertitel)'}</h4>
          <p>{section.text}</p>
          {section.link && (
            <p>
              Link: <a href={section.link} target="_blank" rel="noopener noreferrer">{section.link}</a>
            </p>
          )}
          {section.foto && (
            <img
              src={section.foto}
              alt={`Foto Abschnitt ${idx + 1}`}
              style={{ maxWidth: '200px', maxHeight: '200px' }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default NewsletterForm;
