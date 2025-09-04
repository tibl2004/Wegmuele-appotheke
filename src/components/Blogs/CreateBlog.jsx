import React, { useState } from "react";
import axios from "axios";
import "./CreateBlog.scss";

const CreateBlog = () => {
  const [titel, setTitel] = useState("");
  const [inhalt, setInhalt] = useState("");
  const [bilder, setBilder] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Bilder als Base64 konvertieren
  const handleBildUpload = async (e) => {
    const files = Array.from(e.target.files);
    const base64Files = await Promise.all(
      files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
      })
    );
    setBilder(base64Files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!titel || !inhalt) {
      setError("Titel und Inhalt müssen angegeben werden.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token"); // JWT Token
      const res = await axios.post(
        "https://jugehoerig-backend.onrender.com/api/blogs",
        { titel, inhalt, bilder },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(res.data.message);
      setTitel("");
      setInhalt("");
      setBilder([]);
    } catch (err) {
      setError(err.response?.data?.error || "Fehler beim Erstellen des Blogs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog">
      <h2>Neuen Blog erstellen</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <label>
          Titel:
          <input
            type="text"
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            placeholder="Titel eingeben"
            required
          />
        </label>

        <label>
          Inhalt:
          <textarea
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            placeholder="Inhalt des Blogs"
            rows={8}
            required
          />
        </label>

        <label>
          Bilder hochladen:
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            multiple
            onChange={handleBildUpload}
          />
        </label>

        {bilder.length > 0 && (
          <div className="preview">
            {bilder.map((bild, index) => (
              <img key={index} src={bild} alt={`Vorschau ${index + 1}`} />
            ))}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Speichert..." : "Blog erstellen"}
        </button>
      </form>
    </div>
  );
};

export default CreateBlog;
