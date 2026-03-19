import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Mail, Phone, Trash2, CreditCard, X, Pencil, Minus, Check, User, Baby, Cake, AlertCircle } from 'lucide-react';
import ConfirmPopup from '../components/ConfirmPopup';
import UnsavedChangesPopup from '../components/UnsavedChangesPopup';
import './Directory.css';

function Field({ label, children }) {
  return (
    <div className="detail-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

// ── Shared toggle wrapper ────────────────────────────────────────────────────
function ThreeWayToggle({ value, onChange }) {
  return (
    <div className="three-way-toggle" data-value={value}>
      <div className="three-way-slider"></div>
      <button type="button" className={`three-way-btn ${value === 'unsubscribed' ? 'active danger' : ''}`} onClick={() => onChange('unsubscribed')} title="Unsubscribed"><X size={15} /></button>
      <button type="button" className={`three-way-btn ${value === 'neutral' ? 'active' : ''}`} onClick={() => onChange('neutral')} title="Neutral"><Minus size={15} /></button>
      <button type="button" className={`three-way-btn ${value === 'subscribed' ? 'active success' : ''}`} onClick={() => onChange('subscribed')} title="Subscribed"><Check size={15} /></button>
    </div>
  );
}

// ── Shared 2-Way toggle wrapper ──────────────────────────────────────────────
function TwoWayToggle({ value, onChange }) {
  return (
    <div className="two-way-toggle" data-value={value}>
      <div className="two-way-slider"></div>
      <button type="button" className={`two-way-btn ${value === 'adult' ? 'active' : ''}`} onClick={() => onChange('adult')} title="Adult"><User size={16} /></button>
      <button type="button" className={`two-way-btn ${value === 'child' ? 'active accent' : ''}`} onClick={() => onChange('child')} title="Child"><Baby size={16} /></button>
    </div>
  );
}

// ── Shared Children Sublist ──────────────────────────────────────────────────
function ChildrenSublist({ childrenList, setChildrenList }) {
  const handleAddChild = () => setChildrenList([...childrenList, { tempId: Date.now(), name: '', date_of_birth: '', gender: '' }]);
  const handleChange = (id, field, value) => setChildrenList(childrenList.map(c => (c.id === id || c.tempId === id) ? { ...c, [field]: value } : c));
  const handleRemove = (id) => {
    const child = childrenList.find(c => c.id === id || c.tempId === id);
    if (child.id) setChildrenList(childrenList.map(c => c.id === id ? { ...c, _deleted: true } : c));
    else setChildrenList(childrenList.filter(c => c.tempId !== id));
  };
  const visibleChildren = childrenList.filter(c => !c._deleted);

  return (
    <div className="children-section" style={{marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
      <div className="contact-row" style={{alignItems: 'center', marginBottom: '1rem'}}>
        <h3 style={{fontSize: '0.9rem', margin: '0', flex: 1, color: 'var(--text-main)'}}>Children</h3>
        <button type="button" className="btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={handleAddChild}>+ Add Child</button>
      </div>
      {visibleChildren.map(child => {
        const keyId = child.id || child.tempId;
        return (
          <div key={keyId} className="child-row" style={{background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <input type="text" value={child.name} onChange={e => handleChange(keyId, 'name', e.target.value)} placeholder="Child's first name" required className="compact-input" style={{flex: 1, height: '42px'}} />
            <input type="date" value={child.date_of_birth || ''} onChange={e => handleChange(keyId, 'date_of_birth', e.target.value)} className="compact-input text-muted" style={{width: '140px', height: '42px'}} />
            <select value={child.gender || ''} onChange={e => handleChange(keyId, 'gender', e.target.value)} className="compact-input text-muted" style={{width: '130px', height: '42px'}}>
              <option value="">Gender...</option>
              <option value="Boy">Boy</option>
              <option value="Girl">Girl</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <button type="button" className="icon-btn danger" onClick={() => handleRemove(keyId)} title="Remove Child"><Trash2 size={16} /></button>
          </div>
        );
      })}
      {visibleChildren.length === 0 && <p className="text-muted" style={{fontSize: '0.85rem'}}>No children added.</p>}
    </div>
  );
}

// ── Add Form (right panel) ───────────────────────────────────────────────────
function AddClientPanel({ onClose, onSave }) {
  const [form, setForm] = useState({ 
    name: '', person_type: 'adult', phone: '', email: '', 
    sms_consent: 'neutral', email_consent: 'neutral' 
  });
  const [childrenData, setChildrenData] = useState([]);
  
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSave(form, childrenData);
  };

  return (
    <div className="detail-panel glass-panel" style={{overflowY: 'auto'}}>
      <div className="detail-header">
        <h2>New Client</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <form className="detail-body" onSubmit={handleSubmit}>
        <div className="contact-row">
          <Field label="Full Name">
            <input type="text" value={form.name} onChange={f('name')} placeholder="Client name" required />
          </Field>
          <Field label="Type">
            <TwoWayToggle value={form.person_type} onChange={v => setForm(p => ({...p, person_type: v}))} />
          </Field>
        </div>
        
        {form.person_type === 'adult' ? (
          <>
            <div className="contact-row">
              <Field label="Phone">
                <input type="tel" value={form.phone} onChange={f('phone')} placeholder="Phone number" />
              </Field>
              <Field label="Consent">
                <ThreeWayToggle value={form.sms_consent} onChange={v => setForm(p => ({...p, sms_consent: v}))} />
              </Field>
            </div>
            <div className="contact-row">
              <Field label="Email">
                <input type="email" value={form.email} onChange={f('email')} placeholder="Email address" />
              </Field>
              <Field label="Consent">
                <ThreeWayToggle value={form.email_consent} onChange={v => setForm(p => ({...p, email_consent: v}))} />
              </Field>
            </div>
            <ChildrenSublist childrenList={childrenData} setChildrenList={setChildrenData} />
          </>
        ) : (
          <Field label="Date of Birth">
            <input type="date" value={form.date_of_birth || ''} onChange={f('date_of_birth')} required />
          </Field>
        )}
      </form>
      <div className="detail-footer">
        <button className="btn-primary" onClick={handleSubmit}>Save Client</button>
      </div>
    </div>
  );
}

// ── History Panel Components ────────────────────────────────────────────────
function HistoryPanel({ client, onClose }) {
  const [filter, setFilter] = useState('all');
  
  const mockHistory = [
    { id: 1, type: 'note', title: 'Consultation Note', date: '2024-03-12', content: 'Discussed summer camp options and specific dietary requirements for Judy.' },
    { id: 2, type: 'email', title: 'Welcome Package Sent', date: '2024-03-10', content: 'Package included registration forms and safety guidelines.' },
    { id: 3, type: 'sale', title: 'Purchase: Summer Membership', date: '2024-03-08', content: 'Processed full payment for the 2024 summer season.' },
    { id: 4, type: 'sms', title: 'Reminder: Friday Session', date: '2024-03-05', content: 'Confirmation sent for the upcoming evaluation session.' }
  ];

  const filteredItems = mockHistory.filter(item => filter === 'all' || item.type === filter);

  const getIcon = (type) => {
    switch(type) {
      case 'note': return <Pencil size={14} />;
      case 'email': return <Mail size={14} />;
      case 'sms': return <Phone size={14} />;
      case 'sale': return <CreditCard size={14} />;
      default: return null;
    }
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem' }}>Client History</h3>
          <button onClick={onClose} className="detail-close" style={{ width: '24px', height: '24px' }}><X size={14} /></button>
        </div>
        <div className="history-filters">
          <button className={`history-filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`history-filter-btn ${filter === 'note' ? 'active' : ''}`} onClick={() => setFilter('note')}>Notes</button>
          <button className={`history-filter-btn ${filter === 'email' ? 'active' : ''}`} onClick={() => setFilter('email')}>Email</button>
          <button className={`history-filter-btn ${filter === 'sms' ? 'active' : ''}`} onClick={() => setFilter('sms')}>SMS</button>
          <button className={`history-filter-btn ${filter === 'sale' ? 'active' : ''}`} onClick={() => setFilter('sale')}>Sales</button>
        </div>
      </div>
      <div className="timeline">
        {filteredItems.map(item => (
          <div key={item.id} className="timeline-item">
            <div className={`timeline-icon ${item.type}`}>
              {getIcon(item.type)}
            </div>
            <div className="timeline-content">
              <div className="timeline-meta">
                <span className="timeline-type">{item.type.toUpperCase()}</span>
                <span className="timeline-date">{item.date}</span>
              </div>
              <div className="timeline-title">{item.title}</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {item.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Edit / View Panel (right panel) ─────────────────────────────────────────
function ViewClientPanel({ client, existingChildren, allClients, onClose, onSave, onDelete, onNavigate, onToggleHistory, isHistoryOpen, onCloseAttempt }) {
  const [form, setForm] = useState({ sms_consent: 'neutral', email_consent: 'neutral', ...client });
  const [childrenData, setChildrenData] = useState([]);
  const [initialState, setInitialState] = useState(null);

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  React.useEffect(() => { 
    const initialForm = { sms_consent: 'neutral', email_consent: 'neutral', ...client };
    const initialChildren = existingChildren || [];
    setForm(initialForm); 
    setChildrenData(initialChildren);
    setInitialState({ form: initialForm, children: initialChildren });
  }, [client.id]);

  const hasChanges = React.useMemo(() => {
    if (!initialState) return false;
    
    // Check form changes
    const formChanged = Object.keys(initialState.form).some(key => {
      // Skip computed or non-editable fields if necessary, but here we check all
      return form[key] !== initialState.form[key];
    });
    if (formChanged) return true;

    // Check children changes
    if (childrenData.length !== initialState.children.length) return true;
    const childrenChanged = childrenData.some((child, i) => {
      const initialChild = initialState.children[i];
      return child.name !== initialChild.name || 
             child.date_of_birth !== initialChild.date_of_birth ||
             child.gender !== initialChild.gender ||
             child._deleted !== initialChild._deleted;
    });
    return childrenChanged;
  }, [form, childrenData, initialState]);

  // Expose the hasChanges state to parent if they want to close
  React.useEffect(() => {
    if (onCloseAttempt) {
      // This is a bit tricky with ref/callback, let's pass a function to parent
    }
  }, [hasChanges]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    onSave(client.id, { 
      name: form.name, 
      person_type: form.person_type,
      phone: form.phone, 
      email: form.email,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      sms_consent: form.sms_consent,
      email_consent: form.email_consent
    }, childrenData);
  };

  const isChild = client.person_type === 'child';
  const guardian = isChild ? allClients.find(c => c.id === client.parent_id) : null;

  return (
    <div className="detail-panel glass-panel">
      <div className="detail-container">
        <div className="detail-main" style={{ overflowY: 'auto' }}>
          <div className="detail-header">
            <h2>{client.name}</h2>
            <button className="detail-close" onClick={() => onCloseAttempt(hasChanges, handleSave, onClose)}><X size={17} /></button>
          </div>
          <form className="detail-body" onSubmit={handleSave}>
        <div className="contact-row">
          <Field label="Full Name">
            <input type="text" value={form.name} onChange={f('name')} required />
          </Field>
          <Field label="Type">
            {/* We don't allow changing an adult to a child via exactly the same form easily because of relationships, but we'll show it disabled if child, or interactive if adult */}
            {isChild ? (
              <TwoWayToggle value="child" onChange={v => setForm(p => ({...p, person_type: v}))} />
            ) : (
              <TwoWayToggle value="adult" onChange={v => setForm(p => ({...p, person_type: v}))} />
            )}
          </Field>
        </div>
        
        {isChild ? (
          <>
             <div className="contact-row">
               <Field label="Date of Birth">
                 <input type="date" value={form.date_of_birth || ''} onChange={f('date_of_birth')} className="text-muted" />
                 {form.date_of_birth && (() => {
                   const info = getAgeInfo(form.date_of_birth);
                   if (!info) return null;
                   return (
                     <div style={{ fontSize: '0.75rem', marginTop: '0.15rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
                       {info.age} years old • {info.daysUntil === 0 ? "Birthday is TODAY! 🎂" : `${info.daysUntil} days until birthday`}
                     </div>
                   );
                 })()}
               </Field>
               <Field label="Gender/Pronouns">
                 <select value={form.gender || ''} onChange={f('gender')} className="text-muted">
                   <option value="">None Selected</option>
                   <option value="Boy">Boy</option>
                   <option value="Girl">Girl</option>
                   <option value="Non-binary">Non-binary</option>
                   <option value="Other">Other</option>
                   <option value="Prefer not to say">Prefer not to say</option>
                 </select>
               </Field>
             </div>
             {guardian && (
               <>
                 <Field label="Guardian">
                   <button 
                     type="button" 
                     className="text-link" 
                     style={{ 
                       display: 'block', width: '100%', textAlign: 'left', padding: '0.625rem 0.875rem', 
                       background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border-color)', 
                       borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)', fontWeight: '500',
                       fontSize: '0.95rem'
                     }}
                     onClick={() => onNavigate(guardian)}
                   >
                     {guardian.name}
                   </button>
                 </Field>
                 {(guardian.phone || guardian.email) && (
                   <div className="contact-row" style={{ marginTop: '0.5rem' }}>
                     {guardian.phone && (
                       <Field label="Guardian Phone">
                         <input type="text" value={guardian.phone} readOnly className="text-muted" disabled style={{ background: 'transparent' }} />
                       </Field>
                     )}
                     {guardian.email && (
                       <Field label="Guardian Email">
                         <input type="text" value={guardian.email} readOnly className="text-muted" disabled style={{ background: 'transparent' }} />
                       </Field>
                     )}
                   </div>
                 )}
               </>
             )}
          </>
        ) : (
          <>
            <div className="contact-row">
              <Field label="Phone">
                <input type="tel" value={form.phone || ''} onChange={f('phone')} placeholder="—" />
              </Field>
              <Field label="Consent">
                <ThreeWayToggle value={form.sms_consent || 'neutral'} onChange={v => setForm(p => ({...p, sms_consent: v}))} />
              </Field>
            </div>
            <div className="contact-row">
              <Field label="Email">
                <input type="email" value={form.email || ''} onChange={f('email')} placeholder="—" />
              </Field>
              <Field label="Consent">
                <ThreeWayToggle value={form.email_consent || 'neutral'} onChange={v => setForm(p => ({...p, email_consent: v}))} />
              </Field>
            </div>
            <Field label="Total Sales">
              <input type="text" value={`$${client.total_sales || 0}`} readOnly disabled />
            </Field>
            <ChildrenSublist childrenList={childrenData} setChildrenList={setChildrenData} />
          </>
        )}
      </form>
      <div className="detail-footer">
        <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        <button className="btn-danger-outline" onClick={() => onDelete(client)}>
          Delete
        </button>
      </div>
      </div>

      {!isChild && (
        <div className="inner-sidebar">
          <button 
            className={`inner-sidebar-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={onToggleHistory}
            title="History"
          >
            <CreditCard size={20} />
          </button>
          <button className="inner-sidebar-btn" title="Notes"><Pencil size={20} /></button>
          <button className="inner-sidebar-btn" title="Files"><Mail size={20} /></button>
        </div>
      )}

      {isHistoryOpen && !isChild && (
        <HistoryPanel client={client} onClose={onToggleHistory} />
      )}
    </div>
    </div>
  );
}

const getAgeInfo = (dob) => {
  if (!dob) return null;
  const parts = dob.split('-').map(Number);
  const bDate = new Date(parts[0], parts[1] - 1, parts[2]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let age = today.getFullYear() - bDate.getFullYear();
  const m = today.getMonth() - bDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
    age--;
  }

  let nextBday = new Date(today.getFullYear(), parts[1] - 1, parts[2]);
  if (today > nextBday) {
    nextBday.setFullYear(today.getFullYear() + 1);
  }

  const diffDays = Math.ceil((nextBday - today) / (1000 * 60 * 60 * 24));
  const finalDaysUntil = (diffDays === 365 || diffDays === 366) ? 0 : diffDays;
  
  // within one week before (diffDays >= 358) or after (diffDays <= 7)
  const isBirthdayWeek = (finalDaysUntil <= 7) || (finalDaysUntil >= 358);
  
  return { age, daysUntil: finalDaysUntil, isBirthdayWeek };
};

const getChildBgColor = (gender) => {
  if (!gender || gender === 'Prefer not to say' || gender === 'Other') return 'var(--pastel-gray)';
  if (gender === 'Boy') return 'var(--pastel-blue)';
  if (gender === 'Girl') return 'var(--pastel-pink)';
  if (gender === 'Non-binary') return 'var(--pastel-purple)';
  return 'transparent';
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Clients() {
  const { clients, addClient, deleteClient, updateClient } = useData();
  const [selected, setSelected] = useState(null); // client object or null
  const [showAdd, setShowAdd] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pendingClose, setPendingClose] = useState(null); // { save: fn, discard: fn }

  const panelOpen = selected || showAdd;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone && c.phone.includes(searchQuery)) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    const aParentId = a.person_type === 'child' ? a.parent_id : a.id;
    const bParentId = b.person_type === 'child' ? b.parent_id : b.id;
    
    if (aParentId !== bParentId) {
      const aParent = clients.find(c => c.id === aParentId);
      const bParent = clients.find(c => c.id === bParentId);
      const aName = aParent ? aParent.name : a.name;
      const bName = bParent ? bParent.name : b.name;
      return aName.localeCompare(bName);
    }
    
    if (a.person_type === 'adult') return -1;
    if (b.person_type === 'adult') return 1;
    return a.name.localeCompare(b.name);
  });

  const openAdd = () => { setSelected(null); setShowAdd(true); setIsHistoryOpen(false); };
  const openClient = (c) => { 
    // If different client selected, we should probably also check for changes, 
    // but the request specifically mentioned clicking "outside".
    // For now, let's focus on the click outside and the close button.
    setShowAdd(false); 
    setSelected(c); 
    if (c.person_type === 'child') setIsHistoryOpen(false);
  };

  const attemptClose = (hasChanges, saveFn, closeFn) => {
    if (hasChanges) {
      setPendingClose({ 
        save: () => { saveFn(); closeFn(); setPendingClose(null); },
        discard: () => { closeFn(); setPendingClose(null); }
      });
    } else {
      closeFn();
    }
  };

  const closePanel = () => { setSelected(null); setShowAdd(false); setIsHistoryOpen(false); };

  const handleAdd = async (form, childrenData) => { 
    const newAdult = await addClient(form); 
    if (newAdult && childrenData && childrenData.length > 0) {
      for (const child of childrenData) {
        if (!child._deleted && child.name) {
          await addClient({
            name: child.name,
            date_of_birth: child.date_of_birth || null,
            gender: child.gender || null,
            person_type: 'child',
            parent_id: newAdult.id
          });
        }
      }
    }
    closePanel(); 
  };

  const handleUpdate = async (id, form, childrenData) => {
    await updateClient(id, form);
    if (childrenData) {
      for (const child of childrenData) {
        if (child.id) { // Existing child
          if (child._deleted) await deleteClient(child.id);
          else await updateClient(child.id, { name: child.name, date_of_birth: child.date_of_birth || null, gender: child.gender || null });
        } else if (!child._deleted && child.name) { // New child
          await addClient({
            name: child.name,
            date_of_birth: child.date_of_birth || null,
            gender: child.gender || null,
            person_type: 'child',
            parent_id: id
          });
        }
      }
    }
  };

  return (
    <div className="page-container">
      {/* ── Overlays ── */}
      {panelOpen && <div className="layout-overlay" onClick={() => {
        document.querySelector('.detail-close')?.click();
      }} />}

      <div className={`module-layout${panelOpen ? ' panel-open' : ''}${isHistoryOpen ? ' history-open' : ''}`}>
        {/* ── Left: List panel ── */}
        <div className={`list-panel glass-panel${panelOpen ? ' compressed' : ''}`}>
          {isHistoryOpen && (
            <div className="collapsed-list-label">
              <span>Clients</span>
            </div>
          )}
          {/* ── Persistent header with + button ── */}
          <div className="compact-header">
            <span>Clients</span>
            <button className="add-btn" title="Add new client" onClick={openAdd}>+</button>
          </div>
          <div style={{ padding: '0.65rem 1rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '0.55rem 0.8rem', borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none' 
              }}
            />
          </div>

          {panelOpen ? (
            /* Compressed sidebar mode */
            <div className="compact-list">
              {showAdd && (
                <div className="compact-item add-active">
                  <span className="item-name">+ New Client</span>
                </div>
              )}
              {sortedClients.map(c => {
                const isChild = c.person_type === 'child';
                const guardian = isChild ? clients.find(p => p.id === c.parent_id) : null;
                const ageInfo = c.date_of_birth ? getAgeInfo(c.date_of_birth) : null;
                return (
                  <div
                    key={c.id}
                    className={`compact-item${selected?.id === c.id ? ' active' : ''}`}
                    onClick={() => openClient(c)}
                    style={{ 
                      backgroundColor: isChild ? getChildBgColor(c.gender) : 'transparent',
                      paddingTop: isChild ? '0.2rem' : '0.75rem',
                      paddingBottom: isChild ? '0.2rem' : '0.75rem',
                      paddingLeft: isChild ? '1.5rem' : '1rem',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span className="item-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {isChild && <Baby size={13} style={{ flexShrink: 0, color: 'var(--accent-primary)' }} />}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: isChild ? '0.8rem' : '0.875rem' }}>
                          {c.name} {ageInfo && <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>({ageInfo.age}y)</span>}
                        </span>
                      </span>
                      {ageInfo?.isBirthdayWeek && <Cake size={13} style={{ color: 'var(--accent-primary)', opacity: 0.8 }} />}
                    </div>
                    {isChild && guardian && (
                      <span className="item-sub" style={{ fontSize: '0.7rem' }}>
                        Guardian: {guardian.name} {ageInfo && `• Bday in ${ageInfo.daysUntil}d`}
                      </span>
                    )}
                    {!isChild && <span className="item-sub">${c.total_sales || 0}</span>}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Full table mode */
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact Info</th>
                    <th>Total Sales</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClients.length === 0 ? (
                    <tr><td colSpan="4" className="text-muted text-center py-4">{searchQuery ? 'No clients match your search.' : 'No clients yet.'}</td></tr>
                  ) : sortedClients.map(c => {
                    const isChild = c.person_type === 'child';
                    const guardian = isChild ? clients.find(p => p.id === c.parent_id) : null;
                    const ageInfo = c.date_of_birth ? getAgeInfo(c.date_of_birth) : null;
                    return (
                      <tr 
                        key={c.id} 
                        className="animate-fade-in row-clickable" 
                        onClick={() => openClient(c)}
                        style={{ 
                          backgroundColor: isChild ? getChildBgColor(c.gender) : 'transparent',
                        }}
                      >
                        <td className="font-medium" style={{ paddingLeft: isChild ? '2.5rem' : '1.5rem', paddingTop: isChild ? '0.35rem' : '1rem', paddingBottom: isChild ? '0.35rem' : '1rem' }}>
                          <div style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                              {isChild ? <Baby size={14} style={{color: 'var(--accent-primary)'}} title="Child" /> : <User size={15} className="text-muted" title="Adult" />}
                              <span style={{ fontSize: isChild ? '0.9rem' : '0.95rem' }}>
                                {c.name} {ageInfo && <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({ageInfo.age}y)</span>}
                              </span>
                              {ageInfo?.isBirthdayWeek && <Cake size={15} style={{ color: 'var(--accent-primary)' }} title="Birthday Week!" />}
                            </div>
                            {isChild && guardian && (
                              <div className="text-muted" style={{ fontSize: '0.7rem', paddingLeft: '1.4rem' }}>
                                Guardian: {guardian.name} {ageInfo && `• Birthday in ${ageInfo.daysUntil} days`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ paddingTop: isChild ? '0.35rem' : '1rem', paddingBottom: isChild ? '0.35rem' : '1rem' }}>
                          {!isChild && (
                            <div className="contact-actions">
                              <button className="icon-btn" title="Call" onClick={e => e.stopPropagation()}><Phone size={15} /></button>
                              <button className="icon-btn" title="Email" onClick={e => e.stopPropagation()}><Mail size={15} /></button>
                              <span className="text-muted text-sm">{c.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="font-medium" style={{ color: 'var(--success)', paddingTop: isChild ? '0.35rem' : '1rem', paddingBottom: isChild ? '0.35rem' : '1rem' }}>
                          {!isChild && `$${c.total_sales || 0}`}
                        </td>
                        <td className="action-col" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', paddingTop: isChild ? '0.35rem' : '1rem', paddingBottom: isChild ? '0.35rem' : '1rem' }}>
                          <button className="icon-btn" title="Log Sale" onClick={e => e.stopPropagation()}><CreditCard size={16} /></button>
                          <button className="icon-btn" title="Edit" onClick={e => { e.stopPropagation(); openClient(c); }}><Pencil size={15} /></button>
                          <button className="icon-btn danger" onClick={e => { e.stopPropagation(); setClientToDelete(c); }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right: Detail / Add panel ── */}
        {showAdd && (
          <AddClientPanel onClose={closePanel} onSave={handleAdd} />
        )}
        {selected && (
          <ViewClientPanel
            client={selected}
            existingChildren={clients.filter(c => c.parent_id === selected.id)}
            allClients={clients}
            onClose={closePanel}
            onSave={handleUpdate}
            onDelete={setClientToDelete}
            onNavigate={openClient}
            onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
            isHistoryOpen={isHistoryOpen}
            onCloseAttempt={attemptClose}
          />
        )}
      </div>

      {pendingClose && (
        <UnsavedChangesPopup 
          onSave={pendingClose.save}
          onDiscard={pendingClose.discard}
          onCancel={() => setPendingClose(null)}
        />
      )}

      <ConfirmPopup 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => {
          if (clientToDelete) {
            deleteClient(clientToDelete.id);
            if (selected?.id === clientToDelete.id) {
              closePanel();
            }
            setClientToDelete(null);
          }
        }}
        title="Delete Client"
        message={clientToDelete ? `Are you sure you want to delete ${clientToDelete.name}? This action cannot be undone.` : ''}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
