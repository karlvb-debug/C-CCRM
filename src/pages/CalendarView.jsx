import React, { useState } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays 
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Calendar.css';

export default function CalendarView() {
  const { events, clients, employees, vendors, addEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ 
    title: '', 
    date: format(new Date(), 'yyyy-MM-dd'), 
    type: 'Party',
    client_id: '',
    employee_id: '',
    vendor_id: ''
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    addEvent({
      title: form.title,
      date: new Date(form.date).toISOString(),
      type: form.type,
      client_id: form.client_id || null,
      employee_id: form.employee_id || null,
      vendor_id: form.vendor_id || null
    });
    setForm({ 
      title: '', 
      date: format(new Date(), 'yyyy-MM-dd'), 
      type: 'Party',
      client_id: '',
      employee_id: '',
      vendor_id: ''
    });
    setShowAdd(false);
  };

  const renderHeader = () => (
    <div className="calendar-header">
      <button onClick={prevMonth} className="icon-btn"><ChevronLeft /></button>
      <h2>{format(currentDate, 'MMMM yyyy')}</h2>
      <button onClick={nextMonth} className="icon-btn"><ChevronRight /></button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {format(addDays(startDate, i), 'EEEE')}
        </div>
      );
    }
    return <div className="days row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;

        // Find events for this day
        const dayEvents = events.filter(e => isSameDay(new Date(e.date), cloneDay));

        days.push(
          <div
            className={`col cell ${!isSameMonth(day, monthStart) ? 'disabled' : ''} ${
              isSameDay(day, new Date()) ? 'selected' : ''
            }`}
            key={day}
          >
            <span className="number">{formattedDate}</span>
            <div className="event-list">
              {dayEvents.map(evt => {
                let entityName = '';
                if (evt.client_id) {
                  const c = clients.find(c => String(c.id) === String(evt.client_id));
                  if (c) entityName = c.name;
                } else if (evt.employee_id) {
                  const e = employees.find(e => String(e.id) === String(evt.employee_id));
                  if (e) entityName = e.name;
                } else if (evt.vendor_id) {
                  const v = vendors.find(v => String(v.id) === String(evt.vendor_id));
                  if (v) entityName = v.name;
                }

                return (
                  <div key={evt.id} className={`event-badge type-${evt.type.toLowerCase()}`}>
                    <strong>{evt.title}</strong>
                    {entityName && <span className="entity-name"> — {entityName}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="text-muted">Schedule parties, shifts, and deliveries.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : 'Add Event'}
        </button>
      </header>

      {showAdd && (
        <form className="add-form glass-panel animate-fade-in" onSubmit={handleSubmit}>
          <h3>New Event</h3>
          <div className="form-row">
            <input 
              type="text" 
              placeholder="Event Title" 
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})} 
              required
            />
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm({...form, date: e.target.value})} 
              required
            />
            <select 
              value={form.type} 
              onChange={e => setForm({...form, type: e.target.value, client_id: '', employee_id: '', vendor_id: ''})}
            >
              <option value="Party">Party</option>
              <option value="Painting">Painting Session</option>
              <option value="Delivery">Vendor Delivery</option>
              <option value="Schedule">Employee Shift</option>
            </select>
            
            {(form.type === 'Party' || form.type === 'Painting') && (
              <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}

            {form.type === 'Schedule' && (
              <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}>
                <option value="">-- Select Employee --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            )}

            {form.type === 'Delivery' && (
              <select value={form.vendor_id} onChange={e => setForm({...form, vendor_id: e.target.value})}>
                <option value="">-- Select Vendor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            )}

            <button type="submit" className="btn-primary" style={{flex: '0 0 auto'}}>Save Event</button>
          </div>
        </form>
      )}

      <div className="calendar glass-panel animate-fade-in">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    </div>
  );
}
