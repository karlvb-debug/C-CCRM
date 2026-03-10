import React from 'react';
import { useData } from '../context/DataContext';

export default function Dashboard() {
  const { clients, employees, events } = useData();

  // Simple calculation for upcoming events
  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p className="text-muted">Welcome back! Here's your CRM overview.</p>
      </header>
      <div className="dashboard-grid">
        <div className="stat-card glass-panel">
          <h3>Total Clients</h3>
          <p className="stat-value">{clients.length}</p>
        </div>
        <div className="stat-card glass-panel" style={{ borderTopColor: 'var(--success)' }}>
          <h3>Active Employees</h3>
          <p className="stat-value">{employees.length}</p>
        </div>
        <div className="stat-card glass-panel" style={{ borderTopColor: 'var(--warning)' }}>
          <h3>Upcoming Events</h3>
          <p className="stat-value">{upcomingEvents}</p>
        </div>
      </div>
    </div>
  );
}
