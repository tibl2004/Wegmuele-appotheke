import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import './EventRegistrations.scss';

const EventRegistrations = () => {
  const { eventId } = useParams();
  const token = localStorage.getItem("token");

  const [registrations, setRegistrations] = useState([]);
  const [felder, setFelder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [manualData, setManualData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Lade Anmeldungen
  const fetchRegistrations = async () => {
    try {
      const res = await axios.get(
        `https://jugehoerig-backend.onrender.com/api/event/${eventId}/anmeldungen`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFelder(res.data.felder || []);
      setRegistrations(res.data.registrations || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Fehler beim Laden der Anmeldungen.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [eventId, token]);

  // PDF Export
  const exportPDF = async () => {
    if (!Array.isArray(registrations)) return;

    let eventTitle = "Event";
    try {
      const res = await axios.get(
        `https://jugehoerig-backend.onrender.com/api/event/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      eventTitle = res.data?.titel || eventTitle;
    } catch (err) {
      console.warn("Event-Titel konnte nicht geladen werden:", err);
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titel
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.setFont("helvetica", "bold");
    doc.text(`Anmeldungen: ${eventTitle}`, pageWidth / 2, 25, { align: "center" });

    // Untertitel
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    doc.text(`Event ID: ${eventId}`, pageWidth / 2, 32, { align: "center" });
    doc.text(`Erstellt am: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: "center" });

    // Tabelle
    const tableColumn = ["#", ...felder.map(f => f.feldname), "Anmeldedatum"];
    const tableRows = registrations.map((r, index) => [
      index + 1,
      ...felder.map(f => (r.daten && r.daten[f.feldname] !== undefined ? r.daten[f.feldname] : "-")),
      r.created_at ? new Date(r.created_at).toLocaleString() : "-"
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        fontSize: 10,
        cellPadding: 6,
        font: "helvetica",
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        [tableColumn.length - 1]: { halign: "center" },
      },
      theme: "grid",
      margin: { top: 45, left: 15, right: 15 },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(
          `Seite ${data.pageNumber} von ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
      }
    });

    doc.save(`Event_Anmeldungen_${eventTitle.replace(/\s+/g, "_")}.pdf`);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");

    try {
      await axios.post(
        `https://jugehoerig-backend.onrender.com/api/events/${eventId}/manual-register`,
        { daten: manualData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowPopup(false);
      setManualData({});
      fetchRegistrations();
    } catch (err) {
      console.error(err);
      setSaveError(err.response?.data?.error || "Fehler beim Speichern der Anmeldung.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Lade Anmeldungen…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="registrations-container">
      <div className="header">
        <h2>Anmeldungen für das Event</h2>
        <div className="buttons">
          <button className="export-btn" onClick={exportPDF}>PDF Export</button>
          <button className="manual-btn" onClick={() => setShowPopup(true)}>Manuelle Anmeldung</button>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="no-registrations">Bis jetzt gibt es noch keine Anmeldungen.</div>
      ) : (
        <div className="table-wrapper">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>#</th>
                {felder.map(f => <th key={f.feldname}>{f.feldname}</th>)}
                <th>Anmeldedatum</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, index) => (
                <tr key={r.id}>
                  <td>{index + 1}</td>
                  {felder.map(f => <td key={f.feldname}>{r.daten?.[f.feldname] || "-"}</td>)}
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Manuelle Anmeldung hinzufügen</h3>
            <form onSubmit={handleManualSubmit}>
              {felder.map(f => (
                <div key={f.feldname} className="form-group">
                  <label>{f.feldname}{f.pflicht ? "*" : ""}</label>
                  {f.typ === "select" ? (
                    <select
                      required={f.pflicht}
                      value={manualData[f.feldname] || ""}
                      onChange={e => setManualData({...manualData, [f.feldname]: e.target.value})}
                    >
                      <option value="">-- auswählen --</option>
                      {f.optionen?.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required={f.pflicht}
                      value={manualData[f.feldname] || ""}
                      onChange={e => setManualData({...manualData, [f.feldname]: e.target.value})}
                    />
                  )}
                </div>
              ))}
              {saveError && <p className="error">{saveError}</p>}
              <div className="form-actions">
                <button type="submit" disabled={saving}>{saving ? "Speichern…" : "Speichern"}</button>
                <button type="button" onClick={() => setShowPopup(false)}>Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistrations;
