import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, Trash2 } from 'lucide-react';
import './Directory.css';

export default function Vendors() {
  const { vendors, addVendor, deleteVendor } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', phone: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.category) return;
    addVendor(form);
    setForm({ name: '', category: '', phone: '', email: '' });
    setShowAdd(false);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Vendors</h1>
          <p className="text-muted">Manage your suppliers and partners.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Vendor'}
        </button>
      </header>

      {showAdd && (
        <form className="add-form glass-panel animate-fade-in" onSubmit={handleSubmit}>
          <h3>New Vendor</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Business Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required
            />
            <input 
              type="text" 
              placeholder="Category (e.g., Food, Decor)" 
              value={form.category} 
              onChange={e => setForm({...form, category: e.target.value})} 
              required
            />
          </div>
          <div className="form-row">
            <input 
              type="tel" 
              placeholder="Phone Number" 
              value={form.phone} 
              onChange={e => setForm({...form, phone: e.target.value})} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})} 
            />
          </div>
          <button type="submit" className="btn-primary">Save Vendor</button>
        </form>
      )}

      <div className="table-container glass-panel">
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
              <tr><td colSpan="4" className="text-muted text-center py-4">No vendors found.</td></tr>
            ) : vendors.map(vendor => (
              <tr key={vendor.id} className="animate-fade-in">
                <td className="font-medium">{vendor.name}</td>
                <td><span className="badge">{vendor.category}</span></td>
                <td>
                  <div className="contact-actions">
                    <button className="icon-btn" title="Call/SMS (Stub)"><Phone size={16} /></button>
                    <button className="icon-btn" title="Email (Stub)"><Mail size={16} /></button>
                    <span className="text-muted text-sm">{vendor.phone}</span>
                  </div>
                </td>
                <td className="action-col">
                  <button className="icon-btn danger" onClick={() => deleteVendor(vendor.id)}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
