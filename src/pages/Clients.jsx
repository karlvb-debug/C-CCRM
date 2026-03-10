import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, Trash2, CreditCard } from 'lucide-react';
import './Directory.css';

export default function Clients() {
  const { clients, addClient, deleteClient } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'Individual', phone: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    addClient(form);
    setForm({ name: '', type: 'Individual', phone: '', email: '' });
    setShowAdd(false);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Clients</h1>
          <p className="text-muted">Manage your client relationships.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Client'}
        </button>
      </header>

      {showAdd && (
        <form className="add-form glass-panel animate-fade-in" onSubmit={handleSubmit}>
          <h3>New Client</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Client Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required
            />
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value})}
            >
              <option value="Individual">Individual</option>
              <option value="Corporate">Corporate</option>
            </select>
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
          <button type="submit" className="btn-primary">Save Client</button>
        </form>
      )}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Contact Info</th>
              <th>Total Sales</th>
              <th className="action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="5" className="text-muted text-center py-4">No clients found.</td></tr>
            ) : clients.map(client => (
              <tr key={client.id} className="animate-fade-in">
                <td className="font-medium">{client.name}</td>
                <td><span className="badge">{client.type}</span></td>
                <td>
                  <div className="contact-actions">
                    <button className="icon-btn" title="Call/SMS (Stub)"><Phone size={16} /></button>
                    <button className="icon-btn" title="Email (Stub)"><Mail size={16} /></button>
                    <span className="text-muted text-sm">{client.phone}</span>
                  </div>
                </td>
                <td className="font-medium text-success">${client.totalSales}</td>
                <td className="action-col" style={{display: 'flex', gap: '4px', justifyContent: 'flex-end'}}>
                  <button className="icon-btn" title="Log Sale (POS Stub)"><CreditCard size={18} /></button>
                  <button className="icon-btn danger" onClick={() => deleteClient(client.id)}>
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
