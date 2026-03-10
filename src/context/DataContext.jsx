import React, { createContext, useState, useContext } from 'react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Alice Walker', role: 'Event Manager', phone: '555-0101', email: 'alice@crmpro.com' },
    { id: 2, name: 'Bob Harris', role: 'Staff Trainer', phone: '555-0102', email: 'bob@crmpro.com' }
  ]);

  const [clients, setClients] = useState([
    { id: 1, name: 'Sarah Jenkins', type: 'Individual', phone: '555-0201', email: 'sarah.j@example.com', totalSales: 450 },
    { id: 2, name: 'Acme Corp', type: 'Corporate', phone: '555-0202', email: 'contact@acme.com', totalSales: 1200 }
  ]);

  const [vendors, setVendors] = useState([
    { id: 1, name: 'Party Supplies Co', category: 'Decorations', phone: '555-0301', email: 'sales@partysupplies.com' },
    { id: 2, name: 'Fresh Catering', category: 'Food & Beverage', phone: '555-0302', email: 'orders@freshcatering.com' }
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: 'Sarah Birthday Party', date: new Date().toISOString(), type: 'Party', client_id: 1 },
    { id: 2, title: 'Staff Meeting', date: new Date(Date.now() + 86400000).toISOString(), type: 'Schedule' }
  ]);

  // Generators for adding new records
  const addEmployee = (emp) => setEmployees([...employees, { id: Date.now(), ...emp }]);
  const addClient = (client) => setClients([...clients, { id: Date.now(), ...client, totalSales: 0 }]);
  const addVendor = (vendor) => setVendors([...vendors, { id: Date.now(), ...vendor }]);
  const addEvent = (evt) => setEvents([...events, { id: Date.now(), ...evt }]);

  // Removers
  const deleteEmployee = (id) => setEmployees(employees.filter(e => e.id !== id));
  const deleteClient = (id) => setClients(clients.filter(c => c.id !== id));
  const deleteVendor = (id) => setVendors(vendors.filter(v => v.id !== id));
  const deleteEvent = (id) => setEvents(events.filter(e => e.id !== id));

  return (
    <DataContext.Provider value={{
      employees, addEmployee, deleteEmployee,
      clients, addClient, deleteClient,
      vendors, addVendor, deleteVendor,
      events, addEvent, deleteEvent
    }}>
      {children}
    </DataContext.Provider>
  );
};
