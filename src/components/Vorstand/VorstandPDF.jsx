import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";

const VorstandPDF = () => {
  const token = localStorage.getItem("token");
  const [vorstand, setVorstand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => { fetchVorstand(); }, []);

  const generateVorstandPDF = (user) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Logo optional oben links
    // doc.addImage(logoData, 'PNG', 20, 10, 40, 20);

    // Kopfzeile
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Vorstands-Zugangsdaten", pageWidth / 2, y, { align: "center" });
    y += 15;

    // Anschrift
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`${user.vorname} ${user.nachname}`, 20, y); y += 7;
    doc.text("Musterstraße 1", 20, y); y += 7; // Optional: echte Adresse, wenn vorhanden
    doc.text("8000 Zürich", 20, y); y += 15;

    // Begrüßung und Einleitung
    doc.text(`Sehr geehrte/r ${user.vorname} ${user.nachname},`, 20, y); y += 10;
    const intro = [
      "wir freuen uns, Ihnen Ihre persönlichen Zugangsdaten für das interne Vorstandssystem mitzuteilen.",
      "Bitte bewahren Sie diesen Brief vertraulich auf und vernichten Sie ihn nach dem ersten Login."
    ];
    intro.forEach(line => { doc.text(line, 20, y); y += 7; });
    y += 10;

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
    info.forEach(line => { doc.text(line, 20, y); y += 7; });
    y += 15;

    // Grußformel
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

    doc.save(`Vorstands_Zugang_${user.vorname}_${user.nachname}.pdf`);
  };

  const downloadAllPDFs = () => vorstand.forEach(user => generateVorstandPDF(user));

  if (loading) return <p>Lade Vorstands-Logins…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="vorstand-pdf-container">
      <h2>Vorstands-Zugangsdaten</h2>
      <p>Erstellen Sie für jedes Vorstandsmitglied ein PDF mit Zugangsdaten im Briefstil.</p>
      <button className="download-btn" onClick={downloadAllPDFs}>Alle PDFs herunterladen</button>

      <div className="vorstand-list">
        {vorstand.map(user => (
          <div key={user.benutzername} className="vorstand-item">
            <p><strong>{user.vorname} {user.nachname}</strong> ({user.benutzername})</p>
            <button onClick={() => generateVorstandPDF(user)}>PDF erstellen</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VorstandPDF;
