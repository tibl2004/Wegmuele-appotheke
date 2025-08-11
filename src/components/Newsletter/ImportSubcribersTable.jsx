import React, { useState } from "react";
import axios from "axios";
import "./ImportSubscribersTable.scss";

export default function ImportSubscribersTable() {
  const [rows, setRows] = useState([{ vorname: "", nachname: "", email: "" }]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, { vorname: "", nachname: "", email: "" }]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const submitData = async () => {
    const filtered = rows.filter(
      (r) => r.vorname.trim() && r.nachname.trim() && r.email.trim()
    );

    if (filtered.length === 0) {
      setMessage({ type: "error", text: "Keine gültigen Abonnenten eingegeben." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await axios.post("https://jugehoerig-backend.onrender.com/api/newsletter/import", {
        subscribers: filtered,
      });
      setMessage({ type: "success", text: res.data.message });
      setRows([{ vorname: "", nachname: "", email: "" }]);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.error || "Fehler beim Importieren.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-subscribers-container">
      <h2 className="title">Abonnenten eingeben</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <table className="subscribers-table">
        <thead>
          <tr>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>E-Mail</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={row.vorname}
                  onChange={(e) =>
                    handleChange(index, "vorname", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.nachname}
                  onChange={(e) =>
                    handleChange(index, "nachname", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="email"
                  value={row.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                />
              </td>
              <td className="actions">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="btn btn-remove"
                >
                  Entfernen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-group">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-add"
        >
          + Zeile hinzufügen
        </button>
        <button
          type="button"
          onClick={submitData}
          disabled={loading}
          className="btn btn-submit"
        >
          {loading ? "Importiere..." : "Importieren"}
        </button>
      </div>
    </div>
  );
}
