import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './PublicForm.css';

function DynamicField({ field, value, onChange }) {
  const id = field.id;

  switch (field.type) {
    case 'textarea':
      return (
        <div className="pf-field-group">
          <label htmlFor={id}>{field.label}{field.required && <span className="pf-required">*</span>}</label>
          <textarea
            id={id}
            required={field.required}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={e => onChange(field.label, e.target.value)}
            rows={4}
          />
        </div>
      );

    case 'radio':
      return (
        <div className="pf-field-group">
          <label>{field.label}{field.required && <span className="pf-required">*</span>}</label>
          <div className="pf-radio-group">
            {(field.options || []).map(opt => (
              <label key={opt} className={`pf-radio-label ${value === opt ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={id}
                  value={opt}
                  required={field.required}
                  checked={value === opt}
                  onChange={() => onChange(field.label, opt)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="pf-field-group">
          <label htmlFor={id}>{field.label}{field.required && <span className="pf-required">*</span>}</label>
          <select
            id={id}
            required={field.required}
            value={value || ''}
            onChange={e => onChange(field.label, e.target.value)}
          >
            <option value="">Select an option...</option>
            {(field.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case 'checkbox':
      return (
        <div className="pf-checkbox-group">
          <input
            type="checkbox"
            id={id}
            required={field.required}
            checked={!!value}
            onChange={e => onChange(field.label, e.target.checked)}
          />
          <label htmlFor={id}>
            {field.placeholder || field.label}
            {field.required && <span className="pf-required">*</span>}
          </label>
        </div>
      );

    default:
      return (
        <div className="pf-field-group">
          <label htmlFor={id}>{field.label}{field.required && <span className="pf-required">*</span>}</label>
          <input
            type={field.type}
            id={id}
            required={field.required}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={e => onChange(field.label, e.target.value)}
          />
        </div>
      );
  }
}

export default function PublicForm() {
  const { slug } = useParams();
  const [formDef, setFormDef] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadForm() {
      const { data, error } = await supabase
        .from('webforms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();
      if (error || !data) {
        setLoadError('This form could not be found or is no longer active.');
      } else {
        setFormDef(data);
      }
    }
    loadForm();
  }, [slug]);

  const handleChange = (label, val) => {
    setValues(prev => ({ ...prev, [label]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    // Also map common labels to standard keys for client matching
    const normalizedData = { ...values };
    const labelMaps = {
      'Full Name': 'name', 'Name': 'name',
      'Email Address': 'email', 'Email': 'email',
      'Phone Number': 'phone', 'Phone': 'phone',
    };
    Object.entries(labelMaps).forEach(([label, key]) => {
      if (values[label] !== undefined) normalizedData[key] = values[label];
    });

    const { error } = await supabase
      .from('form_submissions')
      .insert([{ form_id: formDef.id, data: normalizedData }]);

    if (error) {
      setSubmitError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  // ── Loading / Error ──
  if (loadError) {
    return (
      <div className="pf-page">
        <div className="pf-card">
          <div className="pf-logo">
            <img src="/craftncream_logo.svg" alt="Craft & Cream" onError={e => e.target.style.display='none'} />
          </div>
          <h2 className="pf-error-heading">Form Not Found</h2>
          <p className="pf-subtitle">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!formDef) {
    return (
      <div className="pf-page">
        <div className="pf-loader">
          <div className="pf-spinner" />
        </div>
      </div>
    );
  }

  // ── Success ──
  if (submitted) {
    return (
      <div className="pf-page">
        <div className="pf-card pf-success-card">
          <div className="pf-success-icon">✓</div>
          <h2>You're In!</h2>
          <p className="pf-subtitle">Thank you for your submission. We'll be in touch soon.</p>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="pf-page">
      {/* Scrolling background — matches craftandcream.com */}
      <div className="pf-bg-scroll" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`pf-bg-row ${i % 2 === 0 ? 'left' : 'right'}`}>
            CREATE · SIP · PLAY · TREAT · RELAX · CREATE · SIP · PLAY · TREAT · RELAX ·
          </div>
        ))}
      </div>

      <div className="pf-card">
        <div className="pf-logo-wrap">
          <img src="/craftncream_logo.svg" alt="Craft & Cream" className="pf-logo" onError={e => e.target.style.display='none'} />
        </div>

        <div className="pf-header">
          <h2>{formDef.title}</h2>
          {formDef.description && <p className="pf-subtitle">{formDef.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="pf-form">
          {(formDef.fields || []).map(field => (
            <DynamicField
              key={field.id}
              field={field}
              value={values[field.label]}
              onChange={handleChange}
            />
          ))}

          {submitError && <div className="pf-submit-error">{submitError}</div>}

          <button type="submit" className="pf-submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        <div className="pf-footer">
          <p>© 2026 Craft & Cream. Serving the Greater Aiken, SC Area.</p>
        </div>
      </div>
    </div>
  );
}
