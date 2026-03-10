import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// View placeholders
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Clients from './pages/Clients';
import Vendors from './pages/Vendors';
import CalendarView from './pages/CalendarView';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Route>
    </Routes>
  );
}

export default App;
