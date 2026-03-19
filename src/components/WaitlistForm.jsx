import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './WaitlistForm.css';

const WaitlistForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interests: '',
    agreement: false
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            interests: formData.interests,
            sms_consent: formData.agreement ? 'opt_in' : 'neutral',
            email_consent: formData.agreement ? 'opt_in' : 'neutral',
            person_type: 'adult'
          }
        ]);

      if (error) throw error;

      setStatus({ type: 'success', message: 'Successfully joined the waitlist!' });
      setFormData({ name: '', email: '', phone: '', interests: '', agreement: false });
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus({ type: 'error', message: 'Failed to join waitlist. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waitlist-form-container">
      <form onSubmit={handleSubmit} className="waitlist-form">
        <h2>Join the VIP Waitlist</h2>
        
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            placeholder="Jane Doe"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="jane@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="(123) 456-7890"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>I am mostly interested in:</label>
          <div className="radio-group">
            {['Casual Weekend Walk-ins', 'Homeschool/Weekday Activities', 'Moms Group Meetups'].map(option => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
                  name="interests"
                  id="interests"
                  value={option}
                  checked={formData.interests === option}
                  onChange={handleChange}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="agreement"
            checked={formData.agreement}
            onChange={handleChange}
            required
          />
          <label htmlFor="agreement">
            I agree to receive recurring automated marketing and informational text messages.
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Join the VIP Waitlist'}
        </button>

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
};

export default WaitlistForm;
