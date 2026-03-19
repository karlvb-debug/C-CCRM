import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, Trash2, X, Pencil } from 'lucide-react';
import './Directory.css';

function Field({ label, children }) {
  return (
    <div className="detail-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function AddVendorPanel({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', category: '', phone: '', email: '' });
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-header">
        <h2>New Vendor</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <form className="detail-body" onSubmit={handleSubmit}>
        <Field label="Business Name">
          <input type="text" value={form.name} onChange={f('name')} placeholder="Business name" required />
        </Field>
        <Field label="Category">
          <input type="text" value={form.category} onChange={f('category')} placeholder="e.g. Food, Decor, AV" required />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={f('phone')} placeholder="Phone number" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={f('email')} placeholder="Email address" />
        </Field>
      </form>
      <div className="detail-footer">
        <button className="btn-primary" onClick={handleSubmit}>Save Vendor</button>
      </div>
    </div>
  );
}

function ViewVendorPanel({ vendor, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...vendor });
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  React.useEffect(() => { setForm({ ...vendor }); }, [vendor.id]);

  const handleSave = () => {
    onSave(vendor.id, { name: form.name, category: form.category, phone: form.phone, email: form.email });
  };

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-header">
        <h2>{vendor.name}</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <div className="detail-body">
        <Field label="Business Name">
          <input type="text" value={form.name} onChange={f('name')} required />
        </Field>
        <Field label="Category">
          <input type="text" value={form.category || ''} onChange={f('category')} required />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone || ''} onChange={f('phone')} placeholder="—" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email || ''} onChange={f('email')} placeholder="—" />
        </Field>
      </div>
      <div className="detail-footer">
        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        <button className="btn-danger-outline" onClick={() => { onDelete(vendor.id); onClose(); }}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Vendors() {
  const { vendors, addVendor, deleteVendor, updateVendor } = useData();
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const panelOpen = selected || showAdd;

  const openAdd = () => { setSelected(null); setShowAdd(true); };
  const openVendor = (v) => { setShowAdd(false); setSelected(v); };
  const closePanel = () => { setSelected(null); setShowAdd(false); };

  return (
    <div className="page-container">
      <div className={`module-layout${panelOpen ? ' panel-open' : ''}`}>
        {/* ── Left: List panel ── */}
        <div className={`list-panel glass-panel${panelOpen ? ' compressed' : ''}`}>
          <div className="compact-header">
            <span>Vendors</span>
            <button className="add-btn" title="Add new vendor" onClick={openAdd}>+</button>
          </div>

          {panelOpen ? (
            <div className="compact-list">
              {showAdd && (
                <div className="compact-item add-active">
                  <span className="item-name">+ New Vendor</span>
                </div>
              )}
              {vendors.map(v => (
                <div
                  key={v.id}
                  className={`compact-item${selected?.id === v.id ? ' active' : ''}`}
                  onClick={() => openVendor(v)}
                >
                  <span className="item-name">{v.name}</span>
                  <span className="item-sub">{v.category}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Contact Info</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr><td colSpan="4" className="text-muted text-center py-4">No vendors yet.</td></tr>
                  ) : vendors.map(v => (
                    <tr key={v.id} className="animate-fade-in row-clickable" onClick={() => openVendor(v)}>
                      <td className="font-medium">{v.name}</td>
                      <td><span className="badge">{v.category}</span></td>
                      <td>
                        <div className="contact-actions">
                          <button className="icon-btn" title="Call" onClick={e => e.stopPropagation()}><Phone size={15} /></button>
                          <button className="icon-btn" title="Email" onClick={e => e.stopPropagation()}><Mail size={15} /></button>
                          <span className="text-muted text-sm">{v.phone}</span>
                        </div>
                      </td>
                      <td className="action-col" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="icon-btn" title="Edit" onClick={e => { e.stopPropagation(); openVendor(v); }}><Pencil size={15} /></button>
                        <button className="icon-btn danger" onClick={e => { e.stopPropagation(); deleteVendor(v.id); }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right: Detail / Add panel ── */}
        {showAdd && (
          <AddVendorPanel onClose={closePanel} onSave={addVendor} />
        )}
        {selected && (
          <ViewVendorPanel
            vendor={selected}
            onClose={closePanel}
            onSave={updateVendor}
            onDelete={deleteVendor}
          />
        )}
      </div>
    </div>
  );
}
