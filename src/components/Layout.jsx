import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <div className="main-content-inner animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
