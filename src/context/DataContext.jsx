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
  const addRecord = async (table, record, setter, currentList) => {
    const { data, error } = await supabase.from(table).insert([record]).select();
    if (error) {
      console.error(`Error adding to ${table}:`, error);
      return;
    }
    if (data) setter([...currentList, data[0]]);
  };

  // Generic helper for deleting records
  const deleteRecord = async (table, id, setter, currentList) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Error deleting from ${table}:`, error);
      return;
    }
    setter(currentList.filter(item => item.id !== id));
  };

  const addEmployee = (emp) => addRecord('employees', emp, setEmployees, employees);
  const deleteEmployee = (id) => deleteRecord('employees', id, setEmployees, employees);

  const addClient = (client) => addRecord('clients', { ...client, total_sales: 0 }, setClients, clients);
  const deleteClient = (id) => deleteRecord('clients', id, setClients, clients);

  const addVendor = (vendor) => addRecord('vendors', vendor, setVendors, vendors);
  const deleteVendor = (id) => deleteRecord('vendors', id, setVendors, vendors);

  const addEvent = async (evt) => {
    // Need to attach the current authenticated user ID for RLS if needed
    const { data: { user } } = await supabase.auth.getUser();
    addRecord('events', { ...evt, user_auth_id: user?.id }, setEvents, events);
  };
  const deleteEvent = (id) => deleteRecord('events', id, setEvents, events);

  return (
    <DataContext.Provider value={{
      loading,
      employees, addEmployee, deleteEmployee,
      clients, addClient, deleteClient,
      vendors, addVendor, deleteVendor,
      events, addEvent, deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};
