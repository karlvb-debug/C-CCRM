import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, cliRes, venRes, evtRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('vendors').select('*'),
        supabase.from('events').select('*')
      ]);

      if (!empRes.error) setEmployees(empRes.data);
      if (!cliRes.error) setClients(cliRes.data);
      if (!venRes.error) setVendors(venRes.data);
      if (!evtRes.error) setEvents(evtRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Generic helper for adding records
  const addRecord = async (table, record, setter) => {
    const { data, error } = await supabase.from(table).insert([record]).select();
    if (error) {
      console.error(`Error adding to ${table}:`, error);
      return null;
    }
    if (data && data.length > 0) {
      setter(prev => [...prev, data[0]]);
      return data[0];
    }
    return null;
  };

  // Generic helper for deleting records
  const deleteRecord = async (table, id, setter) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return false;
    }
    setter(prev => prev.filter(item => item.id !== id));
    return true;
  };

  // Generic helper for updating records
  const updateRecord = async (table, id, updates, setter) => {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return null;
    }
    if (data && data.length > 0) {
      setter(prev => prev.map(item => item.id === id ? data[0] : item));
      return data[0];
    }
    return null;
  };

  const addEmployee = async (emp) => await addRecord('employees', emp, setEmployees);
  const deleteEmployee = async (id) => await deleteRecord('employees', id, setEmployees);
  const updateEmployee = async (id, updates) => await updateRecord('employees', id, updates, setEmployees);

  const addClient = async (client) => await addRecord('clients', { ...client, total_sales: 0 }, setClients);
  const deleteClient = async (id) => await deleteRecord('clients', id, setClients);
  const updateClient = async (id, updates) => await updateRecord('clients', id, updates, setClients);

  const addVendor = async (vendor) => await addRecord('vendors', vendor, setVendors);
  const deleteVendor = async (id) => await deleteRecord('vendors', id, setVendors);
  const updateVendor = async (id, updates) => await updateRecord('vendors', id, updates, setVendors);

  const addEvent = async (evt) => {
    // Need to attach the current authenticated user ID for RLS if needed
    const { data: { user } } = await supabase.auth.getUser();
    return await addRecord('events', { ...evt, user_auth_id: user?.id }, setEvents);
  };
  const deleteEvent = async (id) => await deleteRecord('events', id, setEvents);

  return (
    <DataContext.Provider value={{
      loading,
      employees, addEmployee, deleteEmployee, updateEmployee,
      clients, addClient, deleteClient, updateClient,
      vendors, addVendor, deleteVendor, updateVendor,
      events, addEvent, deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};
