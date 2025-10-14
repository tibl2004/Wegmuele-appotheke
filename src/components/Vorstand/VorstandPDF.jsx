import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

const VorstandPDF = () => {
  const token = localStorage.getItem("token");
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Alle Vorstände abrufen
  const fetchVorstand = async () => {
    try {
      const res = await axios.get(
        "https://jugehoerig-backend.onrender.com/api/vorstand/logins",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVorstand(res.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Fehler beim Laden der Vorstands-Logins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVorstand();
  }, []);

  // 🔹 PDF für ein Mitglied erstellen
  const generateVorstandPDF = (user) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kopfzeile
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 25, "F");
    doc.setFontSize(16);
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.text("Zugangsdaten für das Vorstandssystem", pageWidth / 2, 16, { align: "center" });

    // Begrüßung
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(`Sehr geehrte/r ${user.vorname} ${user.nachname},`, 20, 40);

    let y = 50;
    const intro = [
      "wir freuen uns, Ihnen Ihre persönlichen Zugangsdaten für das interne Vorstandssystem mitzuteilen.",
      "Bitte bewahren Sie diesen Brief vertraulich auf und vernichten Sie ihn nach dem ersten Login."
    ];
    intro.forEach(line => {
      doc.text(line, 20, y);
      y += 7;
    });

    y += 5;

    // Zugangsdaten
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text(`Benutzername: ${user.benutzername}`, 20, y); y += 7;
    doc.text(`Initiales Passwort: ${user.benutzername}`, 20, y); y += 10;

    // Hinweise zur Passwortänderung
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const info = [
      "Nach dem ersten Login werden Sie aufgefordert, Ihr Passwort zu ändern.",
      "Danach können Sie Ihr Passwort jederzeit selbstständig verwalten."
    ];
    info.forEach(line => {
      doc.text(line, 20, y);
      y += 7;
    });

    y += 10;
    doc.text("Mit freundlichen Grüßen,", 20, y); y += 7;
    doc.text("Ihr Vorstandsteam", 20, y); y += 7;

    // Fußzeile
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(41, 128, 185);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Dieses Dokument ist vertraulich und nur für den vorgesehenen Empfänger bestimmt.",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // PDF speichern
    doc.save(`Vorstands_Zugang_${user.vorname}_${user.nachname}.pdf`);
  };

  // 🔹 Für alle Vorstände einzelne PDFs generieren
  const downloadAllPDFs = () => {
    vorstand.forEach(user => generateVorstandPDF(user));
  };

  if (loading) return <p>Lade Vorstands-Logins…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="vorstand-pdf-container">
      <h2>Vorstands-Zugangsdaten</h2>
      <p>Hier können Sie für jedes Vorstandsmitglied ein PDF mit den Zugangsdaten erstellen.</p>
      <button className="download-btn" onClick={downloadAllPDFs}>
        Zugangsdaten-PDFs herunterladen
      </button>

      <div className="vorstand-list">
        {vorstand.map(user => (
          <div key={user.benutzername} className="vorstand-item">
            <p><strong>{user.vorname} {user.nachname}</strong> ({user.benutzername})</p>
            <button onClick={() => generateVorstandPDF(user)}>PDF für dieses Mitglied</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VorstandPDF;
