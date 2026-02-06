import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./Team.scss";

const MITARBEITER_API = "https://wegm-hle-apotheke-backend.onrender.com/api/mitarbeiter";
const FUNKTIONEN_API = "https://wegm-hle-apotheke-backend.onrender.com/api/funktionen";

export default function Team() {
    const [mitarbeiter, setMitarbeiter] = useState([]);
    const [funktionenList, setFunktionenList] = useState([]);
    const [fotoFile, setFotoFile] = useState(null);
    const [vorname, setVorname] = useState("");
    const [nachname, setNachname] = useState("");
    const [funktionen, setFunktionen] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeMitarbeiter, setActiveMitarbeiter] = useState(null);

    const token = localStorage.getItem("token");
    const [roles, setRoles] = useState([]);

    // ======================
    // Roles dekodieren
    // ======================
    useEffect(() => {
        if (!token) return setRoles([]);
        try {
            const decoded = jwtDecode(token);
            setRoles(decoded.userTypes || []);
        } catch {
            setRoles([]);
        }
    }, [token]);

    const isAdmin = roles.includes("admin");
    const isVorstand = roles.includes("vorstand");

    // ======================
    // Mitarbeiter & Funktionen laden
    // ======================
    const loadMitarbeiter = async () => {
        try {
            const res = await axios.get(MITARBEITER_API);
            const data = res.data.map(m => ({
                ...m,
                funktionen: Array.isArray(m.funktionen) ? m.funktionen : [], // immer Array
                funktionenIds: Array.isArray(m.funktionen) ? m.funktionen.map(f => String(f.id)) : [], // für Checkboxen
            }));
            setMitarbeiter(data);
        } catch (err) {
            console.error(err);
            setError("Mitarbeiter konnten nicht geladen werden.");
        }
    };


    const loadFunktionen = async () => {
        try {
            const res = await axios.get(FUNKTIONEN_API);
            setFunktionenList(res.data);
        } catch {
            setError("Funktionen konnten nicht geladen werden.");
        }
    };

    useEffect(() => {
        loadMitarbeiter();
        loadFunktionen();
    }, []);

    // ======================
    // CREATE
    // ======================
    const createMitarbeiter = async () => {
        if (!vorname || !nachname || funktionen.length === 0) {
            setError("Bitte alle Pflichtfelder ausfüllen.");
            return;
        }

        const formData = new FormData();
        formData.append("vorname", vorname);
        formData.append("nachname", nachname);
        formData.append("funktionen", JSON.stringify(funktionen));
        if (fotoFile) formData.append("foto", fotoFile);

        try {
            setLoading(true);
            await axios.post(MITARBEITER_API, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            resetForm();
            loadMitarbeiter();
        } catch {
            setError("Create fehlgeschlagen.");
        } finally {
            setLoading(false);
        }
    };

    // ======================
    // UPDATE
    // ======================
    const updateMitarbeiter = async () => {
        if (!vorname || !nachname || funktionen.length === 0 || !activeMitarbeiter) {
            setError("Bitte alle Pflichtfelder ausfüllen.");
            return;
        }

        const formData = new FormData();
        formData.append("vorname", vorname);
        formData.append("nachname", nachname);
        formData.append("funktionen", JSON.stringify(funktionen));
        if (fotoFile) formData.append("foto", fotoFile);

        try {
            setLoading(true);
            await axios.put(`${MITARBEITER_API}/${activeMitarbeiter.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            resetForm();
            loadMitarbeiter();
        } catch {
            setError("Update fehlgeschlagen.");
        } finally {
            setLoading(false);
        }
    };

    // ======================
    // RESET FORM
    // ======================
    const resetForm = () => {
        setVorname("");
        setNachname("");
        setFunktionen([]);
        setFotoFile(null);
        setActiveMitarbeiter(null);
        setError("");
    };

    // ======================
    // DELETE
    // ======================
    const handleDelete = async (id) => {
        if (!window.confirm("Wirklich löschen?")) return;
        try {
            await axios.delete(`${MITARBEITER_API}/${id}`);
            loadMitarbeiter();
        } catch {
            setError("Löschen fehlgeschlagen.");
        }
    };

    // ======================
    // EDIT vorbereiten
    // ======================
    const handleEdit = (m) => {
        setActiveMitarbeiter(m);
        setVorname(m.vorname);
        setNachname(m.nachname);
        setFunktionen(m.funktionenIds || []); // richtige Checkboxen
        setFotoFile(null);
    };
    // ======================
    // RENDER
    // ======================
    return (
        <div className="mitarbeiter-admin">
            <h1>Mitarbeiter Verwaltung</h1>
            {error && <div className="error">{error}</div>}

            {isAdmin && (
                <div className="form">
                    <h2>{activeMitarbeiter ? "Mitarbeiter bearbeiten" : "Neuen Mitarbeiter erstellen"}</h2>
                    <input
                        type="text"
                        placeholder="Vorname"
                        value={vorname}
                        onChange={(e) => setVorname(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Nachname"
                        value={nachname}
                        onChange={(e) => setNachname(e.target.value)}
                    />

                    <div className="funktionen">
                        {funktionenList.map(f => (
                            <label key={f.id}>
                                <input
                                    type="checkbox"
                                    value={f.id}
                                    checked={funktionen.includes(String(f.id))} // jetzt korrekt
                                    onChange={(e) => {
                                        const val = String(f.id);
                                        setFunktionen(prev =>
                                            e.target.checked
                                                ? [...prev, val]
                                                : prev.filter(id => id !== val)
                                        );
                                    }}
                                />
                                {f.name}
                            </label>
                        ))}

                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFotoFile(e.target.files[0])}
                    />

                    {activeMitarbeiter ? (
                        <button onClick={updateMitarbeiter} disabled={loading}>
                            {loading ? "Aktualisieren…" : "Aktualisieren"}
                        </button>
                    ) : (
                        <button onClick={createMitarbeiter} disabled={loading}>
                            {loading ? "Speichern…" : "Erstellen"}
                        </button>
                    )}

                    {activeMitarbeiter && <button onClick={resetForm}>Abbrechen</button>}
                </div>
            )}

            <h2>Alle Mitarbeiter</h2>
            <div className="grid">
                {mitarbeiter.map(m => (
                    <div key={m.id} className="item">
                        <img src={m.foto} alt={`${m.vorname} ${m.nachname}`} />
                        <div className="info">
                            <strong>{m.vorname} {m.nachname}</strong>
                            <div className="funktionen">
                                {m.funktionen && m.funktionen.length > 0
                                    ? m.funktionen.map(f => f.name).join(", ")
                                    : "Keine Funktionen"}
                            </div>
                        </div>
                        {(isAdmin || isVorstand) && (
                            <div className="actions">
                                {isAdmin && <button onClick={() => handleEdit(m)}>✎</button>}
                                <button onClick={() => handleDelete(m.id)}>✖</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
