
import React, { useState } from 'react';
import { Appointment, ViewState, AppointmentStatus } from '../types';

interface DashboardProps {
  appointments: Appointment[];
  setCurrentView: (view: ViewState) => void;
  onUpdateAppointment: (app: Appointment) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ appointments, setCurrentView, onUpdateAppointment }) => {
  const [showManualMenu, setShowManualMenu] = useState(false);
  
  const needsAttention = appointments.filter(a => a.status === AppointmentStatus.NEEDS_ATTENTION);
  const confirmedToday = appointments.filter(a => 
    a.status === AppointmentStatus.CONFIRMED && a.date === new Date().toISOString().split('T')[0]
  ).length;

  const resetAllAttention = () => {
    needsAttention.forEach(app => {
      onUpdateAppointment({ ...app, status: AppointmentStatus.CONFIRMED });
    });
    setShowManualMenu(false);
    alert("Absolute Sanctuary Triggered: All mental loops archived.");
  };

  const harmonyLogs = [
    { time: '08:45 AM', action: 'Restorative nudge sent to pending patient.', status: 'Sent' },
    { time: '09:12 AM', action: 'Loop synchronization complete for Michael Chen.', status: 'Harmony' },
    { time: '11:00 AM', action: 'Sovereign vault mirrored to local cache.', status: 'Safe' },
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-top-6 duration-1000 pb-20 relative">
      <button 
        onClick={() => setShowManualMenu(true)}
        className="fixed bottom-12 left-12 z-40 bg-white border border-slate-100 px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 hover:scale-105 transition-all text-slate-500 font-black text-[10px] uppercase tracking-widest active:scale-95"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <span>Manual Intervention</span>
      </button>

      {showManualMenu && (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-lg p-16 space-y-10 shadow-4xl border border-slate-100">
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Command Intervention</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cognitive Offloading Controls</p>
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <button onClick={resetAllAttention} className="w-full py-6 bg-emerald-50 text-emerald-700 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">Force Absolute Sanctuary</button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Automatically archives every pending attention item to quiet the system.</p>
              </div>
              
              <div className="group">
                <button className="w-full py-6 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Wipe active Alarms</button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Immediately stops all system chimes and visual pings.</p>
              </div>
              
              <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl" onClick={() => setShowManualMenu(false)}>Resume Flow</button>
            </div>
          </div>
        </div>
      )}

      <header className="space-y-4">
        <div className="inline-flex items-center space-x-3 bg-emerald-50 px-6 py-2 rounded-full border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest italic">Command active</span>
        </div>
        <div className="space-y-0">
          <h2 className="text-7xl md:text-[9.5rem] font-black text-slate-900 tracking-tighter italic uppercase leading-[0.8]">Command Center</h2>
          <p className="text-emerald-600 font-black text-2xl uppercase tracking-[0.4em] italic opacity-80 pt-6">Workflow Intelligence</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-2xl relative group hover:-translate-y-2 transition-all">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Daily flow</h3>
          <p className="text-7xl font-black text-emerald-600 italic tracking-tighter">{confirmedToday}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Sessions Synced</p>
          <button onClick={() => setCurrentView('scheduling')} className="mt-12 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-3 transition-transform">Enter Ledger →</button>
        </div>
        
        <div className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-2xl group hover:-translate-y-2 transition-all">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Ledger State</h3>
          <p className="text-7xl font-black text-slate-900 italic tracking-tighter">{appointments.filter(a => !a.isInvoiced).length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Unsettled cycles</p>
          <button onClick={() => setCurrentView('billing')} className="mt-12 text-slate-900 font-black text-[10px] uppercase tracking-[0.3em] hover:translate-x-3 transition-transform">Settle Ledger →</button>
        </div>

        <div className="bg-amber-50 p-14 rounded-[4rem] border border-amber-100 shadow-2xl relative group hover:-translate-y-2 transition-all">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">Attention loops</h3>
          <p className="text-7xl font-black text-amber-600 italic tracking-tighter">{needsAttention.length}</p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">System escalated items</p>
          {needsAttention.length > 0 && <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-amber-500 animate-ping"></div>}
        </div>
      </div>

      <section className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-xl space-y-10">
        <div className="flex justify-between items-center">
          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Sanctuary Log</h4>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Live Flow Stream</span>
        </div>
        <div className="space-y-4">
          {harmonyLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-50 hover:bg-white transition-all group">
              <div className="flex items-center space-x-12">
                <span className="text-[11px] font-black text-slate-300 tracking-tighter italic">{log.time}</span>
                <p className="font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{log.action}</p>
              </div>
              <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-5 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">{log.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
