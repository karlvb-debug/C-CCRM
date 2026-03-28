import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { matchOrCreateClient } from '../lib/clientMatcher';
import {
  FileText, Plus, X, Trash2, ChevronRight, Copy, Check,
  Eye, ArrowLeft, GripVertical, AlertCircle, ExternalLink
} from 'lucide-react';
import { DynamicField } from './PublicForm';
import './Webforms.css';

// ── Field Types ──────────────────────────────────────────────────────────────
const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'radio', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox (Agreement)' },
  { value: 'select', label: 'Dropdown' },
  { value: 'date', label: 'Date Picker' },
  { value: 'time', label: 'Time Picker' },
  { value: 'content', label: 'Static Text Block' },
];

function newField() {
  return {
    id: `field_${Date.now()}`,
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    options: [],
  };
}

// ── Form Builder Panel ────────────────────────────────────────────────────────
function FormBuilderPanel({ form: initialForm, onClose, onSaved }) {
  const isNew = !initialForm?.id;
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    success_message: '',
    redirect_url: '',
    webhook_url: '',
    fields: [],
    is_active: true,
    ...(initialForm || {}),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [draggedIdx, setDraggedIdx] = useState(null);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const autoSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleTitleChange = (e) => {
    const t = e.target.value;
    setF('title', t);
    if (isNew) setF('slug', autoSlug(t));
  };

  const addField = () => setF('fields', [...form.fields, newField()]);

  const updateField = (id, key, value) =>
    setF('fields', form.fields.map(f => f.id === id ? { ...f, [key]: value } : f));

  const removeField = (id) =>
    setF('fields', form.fields.filter(f => f.id !== id));

  const addOption = (fieldId) =>
    setF('fields', form.fields.map(f =>
      f.id === fieldId ? { ...f, options: [...(f.options || []), ''] } : f
    ));

  const updateOption = (fieldId, idx, val) =>
    setF('fields', form.fields.map(f =>
      f.id === fieldId
        ? { ...f, options: f.options.map((o, i) => i === idx ? val : o) }
        : f
    ));

  const removeOption = (fieldId, idx) =>
    setF('fields', form.fields.map(f =>
      f.id === fieldId ? { ...f, options: f.options.filter((_, i) => i !== idx) } : f
    ));

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newFields = [...form.fields];
    const [draggedField] = newFields.splice(draggedIdx, 1);
    newFields.splice(idx, 0, draggedField);
    setF('fields', newFields);
    setDraggedIdx(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() || null,
        success_message: form.success_message?.trim() || null,
        redirect_url: form.redirect_url?.trim() || null,
        webhook_url: form.webhook_url?.trim() || null,
        fields: form.fields,
        is_active: form.is_active,
      };
      let result;
      if (isNew) {
        const { data, error: e } = await supabase.from('webforms').insert([payload]).select().single();
        if (e) throw e;
        result = data;
      } else {
        const { data, error: e } = await supabase.from('webforms').update(payload).eq('id', initialForm.id).select().single();
        if (e) throw e;
        result = data;
      }
      onSaved(result, isNew);
    } catch (e) {
      setError(e.message || 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="wf-detail-panel glass-panel wide">
      <div className="wf-detail-header">
        <h2>{isNew ? 'New Form' : 'Edit Form'}</h2>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <div className="wf-split-layout">
      <div className="wf-editor-col">
        {error && <div className="wf-error"><AlertCircle size={14} />{error}</div>}

        <div className="wf-field-group">
          <label>Form Title</label>
          <input type="text" value={form.title} onChange={handleTitleChange} placeholder="e.g. Join the Waitlist" />
        </div>
        <div className="wf-field-group">
          <label>Slug <span className="text-muted" style={{fontWeight:400}}>(URL path)</span></label>
          <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
            <span className="wf-slug-prefix">/form/</span>
            <input type="text" value={form.slug} onChange={e => setF('slug', e.target.value)} placeholder="waitlist" style={{flex:1}} />
          </div>
        </div>
        <div className="wf-field-group">
          <label>Description <span className="text-muted" style={{fontWeight:400}}>(shown on public form)</span></label>
          <input type="text" value={form.description || ''} onChange={e => setF('description', e.target.value)} placeholder="Optional subtitle..." />
        </div>

        <div className="wf-section-title">Form Settings</div>
        <div className="wf-field-group" style={{gap: '1rem'}}>
          <div className="wf-field-group">
            <label>Success Message <span className="text-muted" style={{fontWeight:400}}>(headline after submit)</span></label>
            <input type="text" value={form.success_message || ''} onChange={e => setF('success_message', e.target.value)} placeholder="You're In!" />
          </div>
          <div className="wf-field-group">
            <label>Redirect URL <span className="text-muted" style={{fontWeight:400}}>(optional, redirects after 3s)</span></label>
            <input type="url" value={form.redirect_url || ''} onChange={e => setF('redirect_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="wf-field-group">
            <label>Webhook URL <span className="text-muted" style={{fontWeight:400}}>(Zapier/Make alert ping, optional)</span></label>
            <input type="url" value={form.webhook_url || ''} onChange={e => setF('webhook_url', e.target.value)} placeholder="https://hooks.zapier.com/..." />
          </div>
        </div>

        <div className="wf-section-title">Fields</div>
        <div className="wf-fields-list">
          {form.fields.length === 0 && (
            <p className="text-muted" style={{fontSize:'0.85rem',padding:'0.5rem 0'}}>No fields yet. Add one below.</p>
          )}
          {form.fields.map((field, idx) => (
            <div 
              key={field.id} 
              className="wf-field-item"
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              style={{ opacity: draggedIdx === idx ? 0.5 : 1 }}
            >
              <div className="wf-field-header" style={{cursor: 'grab'}}>
                <GripVertical size={14} className="text-muted" />
                <span className="wf-field-num">#{idx + 1}</span>
                <select
                  value={field.type}
                  onChange={e => updateField(field.id, 'type', e.target.value)}
                  className="wf-type-select"
                >
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {field.type !== 'content' && (
                  <label className="wf-required-toggle">
                    <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} />
                    Required
                  </label>
                )}
                <button className="icon-btn danger" onClick={() => removeField(field.id)}><Trash2 size={14}/></button>
              </div>
              <div className="wf-field-inputs">
                {field.type !== 'content' && (
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => updateField(field.id, 'label', e.target.value)}
                    placeholder="Label"
                  />
                )}
                {['text','email','tel','textarea'].includes(field.type) && (
                  <input
                    type="text"
                    value={field.placeholder}
                    onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                    placeholder="Placeholder (optional)"
                  />
                )}
                {field.type === 'checkbox' && (
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                    placeholder="Checkbox label (Markdown: **bold**, [Link](https://...))"
                  />
                )}
                {field.type === 'content' && (
                  <textarea
                    value={field.placeholder || ''}
                    onChange={e => updateField(field.id, 'placeholder', e.target.value)}
                    placeholder="Enter static text. Use Markdown: **bold**, *italic*, [Link Text](https://example.com)..."
                    rows={4}
                  />
                )}
                {['radio','select'].includes(field.type) && (
                  <div className="wf-options-list">
                    {(field.options || []).map((opt, i) => (
                      <div key={i} className="wf-option-row">
                        <input
                          type="text"
                          value={opt}
                          onChange={e => updateOption(field.id, i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                        />
                        <button className="icon-btn danger" onClick={() => removeOption(field.id, i)}><X size={12}/></button>
                      </div>
                    ))}
                    <button className="btn-secondary" style={{padding:'4px 10px',fontSize:'0.8rem'}} onClick={() => addOption(field.id)}>+ Add Option</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <button className="btn-secondary wf-add-field-btn" onClick={addField}>
          <Plus size={15}/> Add Field
        </button>
      </div>

      <div className="wf-preview-col pf-page">
        <div className="pf-card" style={{ margin: '0 auto', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div className="pf-header" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#3E2723', textAlign: 'center', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              {form.title || 'Form Title'}
            </h2>
            {form.description && <p className="pf-subtitle" style={{ textAlign: 'center', color: '#334155', fontSize: '0.9rem' }}>{form.description}</p>}
          </div>
          
          <form className="pf-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={e => e.preventDefault()}>
            {form.fields.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
                Your form fields will appear here...
              </div>
            ) : (
              form.fields.map(field => (
                <DynamicField key={field.id} field={field} value={''} onChange={() => {}} />
              ))
            )}
            <button 
              type="button" 
              className="pf-submit-btn" 
              style={{
                width: '100%', padding: '1rem', background: '#3E2723', color: '#fff', 
                border: 'none', borderRadius: '12px', fontWeight: 600, marginTop: '0.5rem',
                opacity: 0.8, cursor: 'not-allowed'
              }}
              disabled
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      </div>
      <div className="wf-detail-footer">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : isNew ? 'Create Form' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ── Submissions Panel ─────────────────────────────────────────────────────────
function SubmissionsPanel({ form, clients, onClose, onClientMatched }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', form.id)
      .order('created_at', { ascending: false });
    if (!error) setSubmissions(data || []);
    setLoading(false);
  }, [form.id]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const handleMatch = async (sub) => {
    setMatching(sub.id);
    const client = await matchOrCreateClient(sub.id, sub.data);
    if (client) {
      setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, matched_client_id: client.id } : s));
      onClientMatched();
    }
    setMatching(null);
  };

  const getClientName = (id) => clients.find(c => c.id === id)?.name || `Client #${id}`;

  return (
    <div className="wf-detail-panel glass-panel">
      <div className="wf-detail-header">
        <div>
          <h2>Submissions</h2>
          <p className="text-muted" style={{fontSize:'0.8rem'}}>{form.title}</p>
        </div>
        <button className="detail-close" onClick={onClose}><X size={17} /></button>
      </div>
      <div className="wf-detail-body">
        {loading ? (
          <p className="text-muted" style={{padding:'1rem 0'}}>Loading...</p>
        ) : submissions.length === 0 ? (
          <div className="wf-empty-state">
            <FileText size={32} className="text-muted" />
            <p>No submissions yet.</p>
          </div>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="wf-submission-card">
              <div className="wf-submission-meta">
                <span className="text-muted" style={{fontSize:'0.78rem'}}>
                  {new Date(sub.created_at).toLocaleString()}
                </span>
                {sub.matched_client_id ? (
                  <span className="wf-matched-badge">✓ {getClientName(sub.matched_client_id)}</span>
                ) : (
                  <button
                    className="wf-match-btn"
                    onClick={() => handleMatch(sub)}
                    disabled={matching === sub.id}
                  >
                    {matching === sub.id ? 'Matching...' : 'Match / Create Client'}
                  </button>
                )}
              </div>
              <div className="wf-submission-data">
                {Object.entries(sub.data).map(([k, v]) => (
                  <div key={k} className="wf-data-row">
                    <span className="wf-data-key">{k}</span>
                    <span className="wf-data-val">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Webforms() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [view, setView] = useState(null); // null | { type: 'builder'|'submissions', form }
  const [copiedId, setCopiedId] = useState(null);

  const loadForms = useCallback(async () => {
    setLoading(true);
    const [formsRes, clientsRes] = await Promise.all([
      supabase.from('webforms').select('*, form_submissions(id)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name')
    ]);
    if (!formsRes.error) setForms(formsRes.data || []);
    if (!clientsRes.error) setClients(clientsRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadForms(); }, [loadForms]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this form and all its submissions?')) return;
    await supabase.from('webforms').delete().eq('id', id);
    setForms(prev => prev.filter(f => f.id !== id));
    if (view?.form?.id === id) setView(null);
  };

  const handleSaved = (savedForm, isNew) => {
    if (isNew) {
      setForms(prev => [{ ...savedForm, form_submissions: [] }, ...prev]);
    } else {
      setForms(prev => prev.map(f => f.id === savedForm.id ? { ...f, ...savedForm } : f));
    }
    setView(null);
  };

  const copyLink = (slug, id) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyEmbed = (slug) => {
    const code = `<iframe src="${window.location.origin}/form/${slug}" width="100%" height="800" frameborder="0" style="border:none; border-radius:12px; max-width:600px; margin:0 auto; display:block;"></iframe>`;
    navigator.clipboard.writeText(code);
    alert('Embed code copied to clipboard!');
  };

  const panelOpen = view !== null;

  return (
    <div className="page-container">
      {panelOpen && <div className="layout-overlay" onClick={() => setView(null)} />}

      <div className={`module-layout${panelOpen ? ' panel-open' : ''}`}>
        {/* ── Left: Forms list ── */}
        <div className={`list-panel glass-panel${panelOpen ? ' compressed' : ''}`}>
          <div className="compact-header">
            <span>Webforms</span>
            <button className="add-btn" title="New form" onClick={() => setView({ type: 'builder', form: null })}>+</button>
          </div>

          {loading ? (
            <p className="text-muted" style={{padding:'1rem'}}>Loading...</p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Form</th>
                    <th>Submissions</th>
                    <th>Status</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.length === 0 ? (
                    <tr><td colSpan="4" className="text-muted text-center" style={{padding:'2rem'}}>No forms yet. Create your first!</td></tr>
                  ) : forms.map(f => (
                    <tr key={f.id} className="row-clickable animate-fade-in" onClick={() => setView({ type: 'submissions', form: f })}>
                      <td>
                        <div className="font-medium">{f.title}</div>
                        <div className="text-muted" style={{fontSize:'0.78rem'}}>/form/{f.slug}</div>
                      </td>
                      <td>{(f.form_submissions || []).length}</td>
                      <td>
                        <span className={`wf-status-badge ${f.is_active ? 'active' : 'inactive'}`}>
                          {f.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="action-col" onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex',gap:'4px',justifyContent:'flex-end'}}>
                          <button
                            className="icon-btn"
                            title={copiedId === f.id ? 'Copied!' : 'Copy public link'}
                            onClick={() => copyLink(f.slug, f.id)}
                          >
                            {copiedId === f.id ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                          <button
                            className="icon-btn"
                            title="Copy Embed Code"
                            onClick={() => copyEmbed(f.slug)}
                            style={{fontWeight: 700, fontSize: '10px'}}
                          >
                            &lt;/&gt;
                          </button>
                          <a
                            href={`/form/${f.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="icon-btn"
                            title="Open public form"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            className="icon-btn"
                            title="Edit form"
                            onClick={() => setView({ type: 'builder', form: f })}
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            className="icon-btn danger"
                            title="Delete form"
                            onClick={() => handleDelete(f.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right: Builder or Submissions panel ── */}
        {view?.type === 'builder' && (
          <FormBuilderPanel
            form={view.form}
            onClose={() => setView(null)}
            onSaved={handleSaved}
          />
        )}
        {view?.type === 'submissions' && (
          <SubmissionsPanel
            form={view.form}
            clients={clients}
            onClose={() => setView(null)}
            onClientMatched={loadForms}
          />
        )}
      </div>
    </div>
  );
}
