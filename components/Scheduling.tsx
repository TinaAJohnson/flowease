import React, { useState } from 'react';
import { Appointment, AppointmentStatus, PracticeSettings } from '../types';

interface SchedulingProps {
  appointments: Appointment[];
  onAddAppointment: (app: Appointment) => void;
  onUpdateAppointment: (app: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  settings: PracticeSettings;
}

const Scheduling: React.FC<SchedulingProps> = ({ appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment, settings }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteApp, setEditingNoteApp] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [newPatientName, setNewPatientName] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newNotes, setNewNotes] = useState('');

  const filteredAppointments = appointments.filter(a => viewMode === 'grid' ? a.date === selectedDate : true)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  const exportCSV = () => {
    const headers = ["ID", "Name", "Date", "Time", "Status", "Notes"];
    const rows = appointments.map(a => [
      a.id,
      a.patientName,
      a.date,
      a.time,
      a.status,
      (a.notes || "").replace(/,/g, ";")
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FlowEase_Schedule_Export_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAppointment({
      id: `app-${Date.now()}`,
      patientId: `p-${Date.now()}`,
      patientName: newPatientName,
      date: selectedDate,
      time: newTime,
      duration: settings.sessionLength,
      status: AppointmentStatus.CONFIRMED,
      remindersSent: 0,
      lastReminderAt: null,
      isInvoiced: false,
      isSynced: true,
      notes: newNotes
    });
    setShowAddForm(false);
    setNewPatientName('');
    setNewNotes('');
  };

  const handleNoteUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNoteApp) {
      onUpdateAppointment(editingNoteApp);
      setEditingNoteApp(null);
    }
  };

  const hours = Array.from({ length: 11 }, (_, i) => 8 + i);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-7xl md:text-[9rem] font-black text-slate-900 tracking-tighter uppercase italic leading-none">Patient Flow</h2>
          <p className="text-xl text-slate-400 font-black uppercase tracking-[0.5em] italic">Flow Ledger</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={exportCSV} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">Export CSV</button>
          <div className="bg-slate-100 p-2 rounded-full flex shadow-inner">
            <button onClick={() => setViewMode('grid')} className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}>List</button>
          </div>
          <button onClick={() => setShowAddForm(true)} className="px-12 py-6 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-4xl hover:scale-105 active:scale-95 transition-all">+ New Entry</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden relative">
          <div className="p-16 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-12 py-6 border-2 border-slate-100 rounded-[2.5rem] font-black text-sm uppercase outline-none focus:border-emerald-500 transition-all shadow-sm"/>
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.5em] italic">Local Sanctuary Calendar</span>
          </div>
          <div className="grid grid-cols-12 min-h-[900px] relative">
            <div className="col-span-1 border-r border-slate-50 pt-20 flex flex-col items-center">
              {hours.map(h => <div key={h} className="h-[100px] text-[13px] font-black text-slate-200 italic">{h}:00</div>)}
            </div>
            <div className="col-span-11 p-10 relative">
              {filteredAppointments.map((app) => {
                const h = parseInt(app.time.split(':')[0]);
                const m = parseInt(app.time.split(':')[1]);
                const top = (h - 8) * 100 + (m / 60) * 100;
                return (
                  <div key={app.id} className="absolute left-10 right-10 p-10 rounded-[3.5rem] border-l-[16px] bg-white border-emerald-500 shadow-2xl transition-all hover:scale-[1.01] group cursor-pointer" style={{ top: `${top}px`, height: '95px' }}>
                    <div className="flex justify-between items-center h-full">
                      <div className="flex items-center space-x-8">
                        <div>
                          <p className="font-black text-3xl uppercase italic tracking-tighter text-slate-900 leading-none">{app.patientName}</p>
                          <p className="text-[11px] font-black text-slate-400 uppercase mt-2 italic">{app.time} — Active Loop</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setEditingNoteApp(app)} className="p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors">
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                         </button>
                         {/* Fixed: Use onDeleteAppointment instead of deleteAppointment */}
                         <button onClick={(e) => { e.stopPropagation(); onDeleteAppointment(app.id); }} className="p-4 bg-slate-50 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-14 py-12 italic tracking-widest">Identity</th>
                  <th className="px-14 py-12 italic tracking-widest">Schedule cycle</th>
                  <th className="px-14 py-12 italic tracking-widest">Restorative notes</th>
                  <th className="px-14 py-12 text-right italic tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-14 py-12">
                       <p className="font-black text-2xl italic uppercase tracking-tighter text-slate-900">{app.patientName}</p>
                    </td>
                    <td className="px-14 py-12">
                       <p className="font-black text-slate-600 text-sm">{app.date}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{app.time}</p>
                    </td>
                    <td className="px-14 py-12">
                       <p className="text-slate-400 text-sm font-medium italic truncate max-w-xs">{app.notes || 'No manual notes registered.'}</p>
                    </td>
                    <td className="px-14 py-12 text-right">
                       <div className="flex justify-end items-center gap-4">
                          <button onClick={() => setEditingNoteApp(app)} className="px-8 py-4 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Edit Notes</button>
                          {/* Fixed: Use onDeleteAppointment instead of deleteAppointment */}
                          <button onClick={() => onDeleteAppointment(app.id)} className="text-red-400 font-black text-[10px] uppercase hover:text-red-600 px-2 transition-colors">Wipe</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[150] flex items-center justify-center p-10">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl p-20 shadow-4xl border border-slate-100">
            <h3 className="text-5xl font-black text-slate-900 mb-14 text-center italic uppercase tracking-tighter leading-none">New Flow Entry</h3>
            <form onSubmit={handleAdd} className="space-y-10">
              <input required placeholder="Identity Name" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} className="w-full px-12 py-7 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-xl uppercase outline-none focus:border-emerald-500 transition-all shadow-inner" />
              <div className="grid grid-cols-2 gap-10">
                 <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full px-12 py-7 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-bold text-center" />
                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-12 py-7 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-bold text-center" />
              </div>
              <textarea placeholder="Clinical or restorative context..." value={newNotes} onChange={e => setNewNotes(e.target.value)} className="w-full px-12 py-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] min-h-[160px] outline-none shadow-inner font-medium text-slate-700" />
              <div className="flex gap-8 pt-6">
                <button type="submit" className="flex-1 py-8 bg-emerald-600 text-white rounded-[3rem] font-black uppercase tracking-[0.4em] shadow-4xl">Establish Flow</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-14 py-8 bg-slate-100 text-slate-400 rounded-[3rem] font-black uppercase tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingNoteApp && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[150] flex items-center justify-center p-10">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl p-20 shadow-4xl border border-slate-100">
            <h3 className="text-4xl font-black text-slate-900 mb-4 italic uppercase tracking-tighter">Edit Sanctuary notes</h3>
            <p className="text-emerald-600 font-black text-[11px] uppercase tracking-widest mb-12 italic">{editingNoteApp.patientName} — Private Ledger Record</p>
            <form onSubmit={handleNoteUpdate} className="space-y-10">
              <textarea 
                value={editingNoteApp.notes || ''} 
                onChange={e => setEditingNoteApp({...editingNoteApp, notes: e.target.value})}
                placeholder="Recording restorative context..." 
                className="w-full px-12 py-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] min-h-[250px] outline-none font-medium text-slate-700 text-lg" 
              />
              <div className="flex gap-8">
                <button type="submit" className="flex-1 py-8 bg-slate-900 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-4xl">Archive notes</button>
                <button type="button" onClick={() => setEditingNoteApp(null)} className="px-14 py-8 bg-slate-100 text-slate-400 rounded-[3rem] font-black uppercase tracking-widest">Dismiss</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;
