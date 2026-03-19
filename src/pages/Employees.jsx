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

function AddEmployeePanel({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', role: '', phone: '', email: '' });
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-header">
        <h2>New Employee</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <form className="detail-body" onSubmit={handleSubmit}>
        <Field label="Full Name">
          <input type="text" value={form.name} onChange={f('name')} placeholder="Full name" required />
        </Field>
        <Field label="Role">
          <input type="text" value={form.role} onChange={f('role')} placeholder="Job title / role" required />
        </Field>
        <Field label="Phone">
          <input type="tel" value={form.phone} onChange={f('phone')} placeholder="Phone number" />
        </Field>
        <Field label="Email">
          <input type="email" value={form.email} onChange={f('email')} placeholder="Email address" />
        </Field>
      </form>
      <div className="detail-footer">
        <button className="btn-primary" onClick={handleSubmit}>Save Employee</button>
      </div>
    </div>
  );
}

function ViewEmployeePanel({ employee, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...employee });
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  React.useEffect(() => { setForm({ ...employee }); }, [employee.id]);

  const handleSave = () => {
    onSave(employee.id, { name: form.name, role: form.role, phone: form.phone, email: form.email });
  };

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-header">
        <h2>{employee.name}</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <div className="detail-body">
        <Field label="Full Name">
          <input type="text" value={form.name} onChange={f('name')} required />
        </Field>
        <Field label="Role">
          <input type="text" value={form.role || ''} onChange={f('role')} required />
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
        <button className="btn-danger-outline" onClick={() => { onDelete(employee.id); onClose(); }}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Employees() {
  const { employees, addEmployee, deleteEmployee, updateEmployee } = useData();
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const panelOpen = selected || showAdd;

  const openAdd = () => { setSelected(null); setShowAdd(true); };
  const openEmployee = (emp) => { setShowAdd(false); setSelected(emp); };
  const closePanel = () => { setSelected(null); setShowAdd(false); };

  return (
    <div className="page-container">
      <div className={`module-layout${panelOpen ? ' panel-open' : ''}`}>
        {/* ── Left: List panel ── */}
        <div className={`list-panel glass-panel${panelOpen ? ' compressed' : ''}`}>
          <div className="compact-header">
            <span>Employees</span>
            <button className="add-btn" title="Add new employee" onClick={openAdd}>+</button>
          </div>

          {panelOpen ? (
            <div className="compact-list">
              {showAdd && (
                <div className="compact-item add-active">
                  <span className="item-name">+ New Employee</span>
                </div>
              )}
              {employees.map(emp => (
                <div
                  key={emp.id}
                  className={`compact-item${selected?.id === emp.id ? ' active' : ''}`}
                  onClick={() => openEmployee(emp)}
                >
                  <span className="item-name">{emp.name}</span>
                  <span className="item-sub">{emp.role}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-container">
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
                    <tr><td colSpan="4" className="text-muted text-center py-4">No employees yet.</td></tr>
                  ) : employees.map(emp => (
                    <tr key={emp.id} className="animate-fade-in row-clickable" onClick={() => openEmployee(emp)}>
                      <td className="font-medium">{emp.name}</td>
                      <td><span className="badge">{emp.role}</span></td>
                      <td>
                        <div className="contact-actions">
                          <button className="icon-btn" title="Call" onClick={e => e.stopPropagation()}><Phone size={15} /></button>
                          <button className="icon-btn" title="Email" onClick={e => e.stopPropagation()}><Mail size={15} /></button>
                          <span className="text-muted text-sm">{emp.phone}</span>
                        </div>
                      </td>
                      <td className="action-col" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="icon-btn" title="Edit" onClick={e => { e.stopPropagation(); openEmployee(emp); }}><Pencil size={15} /></button>
                        <button className="icon-btn danger" onClick={e => { e.stopPropagation(); deleteEmployee(emp.id); }}><Trash2 size={16} /></button>
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
          <AddEmployeePanel onClose={closePanel} onSave={addEmployee} />
        )}
        {selected && (
          <ViewEmployeePanel
            employee={selected}
            onClose={closePanel}
            onSave={updateEmployee}
            onDelete={deleteEmployee}
          />
        )}
      </div>
    </div>
  );
}
