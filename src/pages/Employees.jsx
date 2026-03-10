import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, Trash2 } from 'lucide-react';
import './Directory.css';

export default function Employees() {
  const { employees, addEmployee, deleteEmployee } = useData();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    addEmployee(form);
    setForm({ name: '', role: '', phone: '', email: '' });
    setShowAdd(false);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Employees</h1>
          <p className="text-muted">Manage your staff directory.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Employee'}
        </button>
      </header>

      {showAdd && (
        <form className="add-form glass-panel animate-fade-in" onSubmit={handleSubmit}>
          <h3>New Employee</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Full Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required
            />
            <input 
              type="text" 
              placeholder="Role" 
              value={form.role} 
              onChange={e => setForm({...form, role: e.target.value})} 
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
          <button type="submit" className="btn-primary">Save Employee</button>
        </form>
      )}

      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact Info</th>
              <th className="action-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan="4" className="text-muted text-center py-4">No employees found.</td></tr>
            ) : employees.map(emp => (
              <tr key={emp.id} className="animate-fade-in">
                <td className="font-medium">{emp.name}</td>
                <td><span className="badge">{emp.role}</span></td>
                <td>
                  <div className="contact-actions">
                    <button className="icon-btn" title="Call/SMS (Stub)"><Phone size={16} /></button>
                    <button className="icon-btn" title="Email (Stub)"><Mail size={16} /></button>
                    <span className="text-muted text-sm">{emp.phone}</span>
                  </div>
                </td>
                <td className="action-col">
                  <button className="icon-btn danger" onClick={() => deleteEmployee(emp.id)}>
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
