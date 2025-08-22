// SubscribersList.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './NewsletterSubscribersList.scss';

export default function NewsletterSubscribersList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    let mounted = true;
    const fetchSubscribers = async () => {
      setLoading(true);
      setError(null);
      try {
        // Beispiel: Token aus localStorage (JWT) anhängen, falls nötig
        const token = localStorage.getItem('token');
        const res = await axios.get('https://jugehoerig-backend.onrender.com/api/newsletter/subscribers', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!mounted) return;
        setSubscribers(res.data || []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError('Fehler beim Laden der Abonnenten.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSubscribers();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers
      .filter(s => {
        if (statusFilter === 'all') return true;
        return s.status === statusFilter;
      })
      .filter(s => {
        if (!q) return true;
        return (
          (s.vorname || '').toLowerCase().includes(q) ||
          (s.nachname || '').toLowerCase().includes(q) ||
          (s.email || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.subscribed_at) - new Date(a.subscribed_at));
  }, [subscribers, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages]);
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);
  function downloadCSV() {
    const header = ['ID', 'Vorname', 'Nachname', 'Email', 'Subscribed At', 'Unsubscribed At', 'Status'];
    const rows = filtered.map(s => [
      s.id,
      s.vorname,
      s.nachname,
      s.email,
      s.subscribed_at || '',
      s.unsubscribed_at || '',
      s.status
    ]);
    // hier war der Fehler: Backticks raus, nur Anführungszeichen korrekt escapen
    const csv = [header, ...rows]
      .map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  

  return (
    <section className="subscribers-panel" aria-labelledby="subscribers-title">
      <div className="panel-header">
        <h1 id="subscribers-title">Abonnenten</h1>
        <div className="controls">
          <div className="control-row">
            <label className="sr-only" htmlFor="search">Suchen</label>
            <input
              id="search"
              className="search-input"
              placeholder="Suche nach Name oder E‑Mail"
              value={query}
              onChange={e => { setQuery(e.target.value); setPage(1); }}
            />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="status-select"
              aria-label="Status filter"
            >
              <option value="all">Alle</option>
              <option value="aktiv">Aktiv</option>
              <option value="inaktiv">Inaktiv</option>
            </select>
            <button className="btn" type="button" onClick={downloadCSV}>CSV Export</button>
          </div>
        </div>
      </div>

      <div className="panel-body">
        {loading ? (
          <div className="status-message">Lade Abonnenten…</div>
        ) : error ? (
          <div className="status-message error">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="status-message">Keine Abonnenten gefunden.</div>
        ) : (
          <table className="subscribers-table" role="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>E‑Mail</th>
                <th>Angelegt</th>
                <th>Abgemeldet</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td className="name-cell">{s.vorname} {s.nachname}</td>
                  <td className="email-cell">{s.email}</td>
                  <td>{s.subscribed_at ? new Date(s.subscribed_at).toLocaleString() : '-'}</td>
                  <td>{s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleString() : '-'}</td>
                  <td><span className={`status-pill status-${s.status}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel-footer">
        <div className="pager">
          <button className="pager-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Zurück</button>
          <div className="pager-info">Seite {page} / {totalPages}</div>
          <button className="pager-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Weiter</button>
        </div>
        <div className="count">Anzahl: {filtered.length}</div>
      </div>
    </section>
  );
}


