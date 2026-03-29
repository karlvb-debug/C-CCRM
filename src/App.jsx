import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Auth from './components/Auth';

// View placeholders
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import CalendarView from './pages/CalendarView';
import Webforms from './pages/Webforms';
import PublicForm from './pages/PublicForm';
import Employees from './pages/Employees';
import Vendors from './pages/Vendors';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <Routes>
      {/* Public routes — no auth required */}
      <Route path="/form/:slug" element={<PublicForm />} />
      {/* Authenticated routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/webforms" element={<Webforms />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/vendors" element={<Vendors />} />
      </Route>
    </Routes>
  );
}

export default App;
