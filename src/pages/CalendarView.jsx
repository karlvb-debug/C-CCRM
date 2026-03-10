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
  const { events, addEvent } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'Party' });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    addEvent({
      title: form.title,
      date: new Date(form.date).toISOString(),
      type: form.type
    });
    setForm({ title: '', date: format(new Date(), 'yyyy-MM-dd'), type: 'Party' });
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
              {dayEvents.map(evt => (
                <div key={evt.id} className={`event-badge type-${evt.type.toLowerCase()}`}>
                  {evt.title}
                </div>
              ))}
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
              onChange={e => setForm({...form, type: e.target.value})}
            >
              <option value="Party">Party</option>
              <option value="Painting">Painting Session</option>
              <option value="Delivery">Vendor Delivery</option>
              <option value="Schedule">Employee Shift</option>
            </select>
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
