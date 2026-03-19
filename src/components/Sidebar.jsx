import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  FileText,
  Settings 
} from 'lucide-react';

import './Sidebar.css';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/clients', icon: Briefcase, label: 'Clients' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/webforms', icon: FileText, label: 'Webforms' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-box">
          <Briefcase className="logo-icon" size={24} />
        </div>
        <h2>CRM Pro</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item">
          <Settings size={20} className="nav-icon" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
