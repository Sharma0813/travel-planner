
import React, { useState } from 'react'

function formatDate(d){ return d ? d : ''; }

export default function App(){
  const [trips, setTrips] = useState([]);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reachTime, setReachTime] = useState('');
  const [notes, setNotes] = useState('');

  function addTrip(e){
    e.preventDefault();
    if(!title || !destination) return alert('Please add title and destination');
    const t = { id: Date.now(), title, destination, startDate, endDate, reachTime, notes, items: [] };
    setTrips(prev => [...prev, t]);
    setTitle(''); setDestination(''); setStartDate(''); setEndDate(''); setReachTime(''); setNotes('');
  }

  function removeTrip(id){
    setTrips(prev => prev.filter(t => t.id !== id));
  }

  function addItem(tripId, text){
    if(!text) return;
    setTrips(prev => prev.map(t => {
      if(t.id === tripId) return {...t, items: [...t.items, { id: Date.now(), text }]};
      return t;
    }));
  }

  function downloadJSON(){
    const payload = { createdAt: new Date().toISOString(), trips };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-plan.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function downloadCSV(){
    let rows = [['Title','Destination','StartDate','EndDate','ReachTime','Notes','Items']];
    trips.forEach(t => {
      rows.push([t.title, t.destination, formatDate(t.startDate), formatDate(t.endDate), t.reachTime || '', t.notes || '', (t.items||[]).map(i=>i.text).join('; ')]);
    });
    const csv = rows.map(r => r.map(cell => '"'+String(cell).replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-plan.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header>
        <h1>Travel Planner</h1>
        <p>Create trips, add checklist items and download your plan.</p>
      </header>

      <main>
        <form onSubmit={addTrip} className="card">
          <h2>Add New Trip</h2>
          <div className="row">
            <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Weekend in Manali" /></label>
            <label>Destination<input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="City or place" /></label>
          </div>
          <div className="row">
            <label>Start Date<input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} /></label>
            <label>End Date<input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} /></label>
          </div>
          <div className="row">
            <label>Reach Time<input type="time" value={reachTime} onChange={e=>setReachTime(e.target.value)} /></label>
          </div>
          <label>Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Packing, budget, bookings..."></textarea></label>
          <div className="actions">
            <button type="submit">Add Trip</button>
            <button type="button" onClick={()=>{ setTitle(''); setDestination(''); setStartDate(''); setEndDate(''); setReachTime(''); setNotes(''); }}>Clear</button>
          </div>
        </form>

        <section className="trips">
          {trips.length === 0 && <p className="muted">No trips yet — add one above.</p>}
          {trips.map(trip => (
            <article key={trip.id} className="card trip">
              <div className="trip-header">
                <div>
                  <h3>{trip.title}</h3>
                  <div className="muted">{trip.destination} • {trip.startDate || '—'} to {trip.endDate || '—'} • Reach at {trip.reachTime || '—'}</div>
                </div>
                <div>
                  <button onClick={()=>removeTrip(trip.id)} className="danger">Delete</button>
                </div>
              </div>
              <p>{trip.notes}</p>
              <TripItems trip={trip} onAddItem={addItem} />
            </article>
          ))}
        </section>

        <aside className="download card">
          <h2>Export Plan</h2>
          <p>Download your travel plan as JSON or CSV to save or share.</p>
          <div className="actions">
            <button onClick={downloadJSON}>Download JSON</button>
            <button onClick={downloadCSV}>Download CSV</button>
          </div>
        </aside>
      </main>

      <footer>
        <small>Made with ❤️ — simple travel planner</small>
      </footer>
    </div>
  )
}

function TripItems({trip, onAddItem}){
  const [text, setText] = useState('');
  return (
    <div className="items">
      <h4>Checklist / Notes</h4>
      <div className="add-item">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="e.g. Book bus tickets" />
        <button onClick={()=>{ onAddItem(trip.id, text); setText(''); }}>Add</button>
      </div>
      <ul>
        {(trip.items||[]).map(it => <li key={it.id}>{it.text}</li>)}
      </ul>
    </div>
  )
}
