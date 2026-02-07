import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  DndContext,
  closestCenter
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "./Contact.scss";

const EMERGENCY_API = "https://wegm-hle-apotheke-backend.onrender.com/api/emergency";
const CONTACT_API = "https://wegm-hle-apotheke-backend.onrender.com/api/contact";

/* ======================
   Sortable Item
====================== */
function SortableItem({ item, isAdmin, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
    disabled: !isAdmin
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isAdmin ? "grab" : "default"
  };

  return (
    <div ref={setNodeRef} style={style} className="emergency-item">
      <div className="text">
        <strong>{item.title}</strong>
        <span>{item.number}</span>
      </div>
      {isAdmin && (
        <div className="actions" {...attributes} {...listeners}>
          <button onClick={() => onEdit(item)}>✎</button>
          <button onClick={() => onDelete(item.id)}>✖</button>
          <span className="drag">☰</span>
        </div>
      )}
    </div>
  );
}

/* ======================
   Main Component
====================== */
export default function Contact() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");
  const [activeItem, setActiveItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const [contact, setContact] = useState(null);
  const [contactTitle, setContactTitle] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactFax, setContactFax] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactError, setContactError] = useState("");
  const [showContactModal, setShowContactModal] = useState(false);

  const token = localStorage.getItem("token");
  const [roles, setRoles] = useState([]);
  const isAdmin = roles.includes("admin");

  // ======================
  // Rollen dekodieren
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

  // ======================
  // Daten laden
  // ======================
  const loadEmergency = async () => {
    try {
      const res = await axios.get(EMERGENCY_API);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadContact = async () => {
    try {
      const res = await axios.get(CONTACT_API);
      setContact(res.data);
      if (res.data) {
        setContactTitle(res.data.title);
        setContactAddress(res.data.address);
        setContactPhone(res.data.phone);
        setContactFax(res.data.fax);
        setContactEmail(res.data.email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEmergency();
    loadContact();
  }, []);

  // ======================
  // Notfallnummer CRUD + DnD
  // ======================
  const openCreateModal = () => {
    setActiveItem(null);
    setTitle("");
    setNumber("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setActiveItem(item);
    setTitle(item.title);
    setNumber(item.number);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveItem(null);
    setTitle("");
    setNumber("");
    setError("");
  };

  const createItem = async () => {
    if (!title || !number) return setError("Titel & Nummer erforderlich.");
    try {
      await axios.post(
        EMERGENCY_API,
        { title, number },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeModal();
      loadEmergency();
    } catch {
      setError("Erstellen fehlgeschlagen.");
    }
  };

  const updateItem = async () => {
    try {
      await axios.put(
        `${EMERGENCY_API}/${activeItem.id}`,
        { title, number },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closeModal();
      loadEmergency();
    } catch {
      setError("Update fehlgeschlagen.");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Wirklich löschen?")) return;
    try {
      await axios.delete(`${EMERGENCY_API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadEmergency();
    } catch {
      alert("Löschen fehlgeschlagen.");
    }
  };

  const handleDragEnd = async (event) => {
    if (!isAdmin) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update Reihenfolge auf Backend
    try {
      const payload = newItems.map((item, index) => ({ id: item.id, position: index + 1 }));
      await axios.put(`${EMERGENCY_API}/order`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Reihenfolge speichern fehlgeschlagen:", err);
    }
  };

  // ======================
  // Kontakt CRUD (Admin only)
  // ======================
  const openContactModal = () => {
    setContactError("");
    setShowContactModal(true);
  };

  const closeContactModal = () => setShowContactModal(false);

  const saveContact = async () => {
    if (!contactTitle || !contactAddress) return setContactError("Titel & Adresse erforderlich.");
    try {
      if (contact) {
        await axios.put(
          `${CONTACT_API}`,
          { title: contactTitle, address: contactAddress, phone: contactPhone, fax: contactFax, email: contactEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          CONTACT_API,
          { title: contactTitle, address: contactAddress, phone: contactPhone, fax: contactFax, email: contactEmail },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      closeContactModal();
      loadContact();
    } catch {
      setContactError("Speichern fehlgeschlagen.");
    }
  };

  // ======================
  // Render
  // ======================
  return (
    <div className="emergency-contact-wrapper">
      {/* Notfallnummern */}
      <div className="emergency-section">
        <h1>🚑 Notfallnummern</h1>
        {isAdmin && <button className="add-btn" onClick={openCreateModal}>➕</button>}

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {items.map(item => (
              <SortableItem
                key={item.id}
                item={item}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={deleteItem}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

 {/* Kontakt */}
<div className="contact-section">
  <h1>📞 Kontakt</h1>
  {contact ? (
    <div className="contact-info">
      <p><strong>{contact.title}</strong></p>
      <p>{contact.address}</p>
      <p>Tel: {contact.phone}</p>
      <p>Fax: {contact.fax}</p>
      <p>Email: {contact.email}</p>

      {/* Neue Buttons */}
      <div className="contact-buttons">
        {/* Google Maps */}
        {contact.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="map-btn"
          >
            🗺️ Google Maps
          </a>
        )}

        {/* Email */}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="email-btn"
          >
            ✉️ Email
          </a>
        )}
      </div>
    </div>
  ) : (
    <p>Kein Kontakt vorhanden.</p>
  )}
  {isAdmin && (
    <button className="edit-btn" onClick={openContactModal}>
      {contact ? "✎ Bearbeiten" : "➕ Erstellen"}
    </button>
  )}
</div>

      {/* Modal Notfallnummer */}
      {isAdmin && showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{activeItem ? "Notfallnummer bearbeiten" : "Notfallnummer erstellen"}</h2>
            {error && <div className="error">{error}</div>}
            <input placeholder="Titel" value={title} onChange={e => setTitle(e.target.value)} />
            <input placeholder="Nummer" value={number} onChange={e => setNumber(e.target.value)} />
            <div className="modal-actions">
              <button onClick={activeItem ? updateItem : createItem}>
                {activeItem ? "Speichern" : "Erstellen"}
              </button>
              <button className="cancel" onClick={closeModal}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kontakt */}
      {isAdmin && showContactModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{contact ? "Kontakt bearbeiten" : "Kontakt erstellen"}</h2>
            {contactError && <div className="error">{contactError}</div>}
            <input placeholder="Titel" value={contactTitle} onChange={e => setContactTitle(e.target.value)} />
            <input placeholder="Adresse" value={contactAddress} onChange={e => setContactAddress(e.target.value)} />
            <input placeholder="Telefon" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
            <input placeholder="Fax" value={contactFax} onChange={e => setContactFax(e.target.value)} />
            <input placeholder="Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            <div className="modal-actions">
              <button onClick={saveContact}>Speichern</button>
              <button className="cancel" onClick={closeContactModal}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
