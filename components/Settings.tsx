
import React, { useState } from 'react';
import { SoundType, Appointment, AppointmentStatus, PracticeSettings, CalendarProvider } from '../types';
import CalendarIntegrations from './CalendarIntegrations';

interface SettingsProps {
  settings: PracticeSettings;
  setSettings: (s: PracticeSettings) => void;
  appointments: Appointment[];
  onUpdateAppointment: (app: Appointment) => void;
  onExport: () => void;
  onPurge: () => void;
  onImport: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings, appointments, onUpdateAppointment, onExport, onPurge, onImport }) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [sanctuaryLevel, setSanctuaryLevel] = useState('none');

  const pendingAttention = appointments.filter(a => a.status === AppointmentStatus.NEEDS_ATTENTION);

  const applySanctuary = (level: string) => {
    setSanctuaryLevel(level);
    if (level === 'soft') {
      alert("Soft Sanctuary: All system chimes and visual pings silenced.");
    } else if (level === 'deep') {
      alert("Deep Sanctuary: All active nudge loops paused for the next 24 hours.");
    } else if (level === 'absolute') {
      pendingAttention.forEach(app => {
        onUpdateAppointment({ ...app, status: AppointmentStatus.CONFIRMED });
      });
      alert("Absolute Sanctuary: All pending mental loops auto-confirmed and archived.");
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 relative">
      <button 
        onClick={() => setShowSettingsMenu(true)}
        className="fixed bottom-12 left-12 z-40 bg-white border border-slate-100 px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 hover:scale-105 transition-all text-slate-500 font-black text-[10px] uppercase tracking-widest active:scale-95"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
        <span>Logic Manual</span>
      </button>

      {showSettingsMenu && (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-lg p-16 space-y-10 shadow-4xl border border-slate-100">
            <div className="text-center space-y-2">
              <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Logic Interventions</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Cognitive Maintenance</p>
            </div>
            
            <div className="space-y-6">
              <div className="group text-center">
                <button className="w-full py-6 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-slate-600">Re-Initialize Automation</button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-6">Restarts the background check for patient reply signals.</p>
              </div>
              
              <div className="group text-center">
                <button className="w-full py-6 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-slate-600">Clarify Sanctuary Logic</button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-6">Forces a refresh of all "Attention Loops" based on new nudge rhythms.</p>
              </div>
              
              <div className="group text-center">
                <button className="w-full py-6 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all text-slate-600">Sync Local Ledger Cache</button>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-6">Immediately commits every on-screen record to the sovereign vault.</p>
              </div>

              <button className="w-full py-6 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl mt-6" onClick={() => setShowSettingsMenu(false)}>Close manual</button>
            </div>
          </div>
        </div>
      )}

      <header className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center space-x-3 bg-emerald-50 px-6 py-2.5 rounded-full border border-emerald-100">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-widest italic">Logic Sanctuary</span>
        </div>
        <h2 className="text-7xl md:text-[9.5rem] font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8]">Sanctuary Logic</h2>
        <p className="text-slate-500 text-2xl font-medium leading-relaxed pt-4 italic">
          Configure the rhythms of the background system. Reclaim your mental space by adjusting nudge thresholds and managing sovereign data.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-white p-14 rounded-[4rem] border border-slate-100 shadow-2xl space-y-12">
          <div className="flex items-center space-x-6">
            <div className="bg-emerald-500 p-5 rounded-[2rem] shadow-xl shadow-emerald-100">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Nudge Rhythm</h3>
          </div>

          <div className="space-y-10">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Attention Threshold (H)</label>
                <span className="text-2xl font-black italic text-emerald-600">{settings.criticalThresholdHours}H</span>
              </div>
              <input 
                type="range" min="12" max="72" step="6"
                value={settings.criticalThresholdHours}
                onChange={(e) => setSettings({...settings, criticalThresholdHours: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Time before an unconfirmed session escalates into an "Attention Loop".</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Confirmation Cycles</label>
                <span className="text-2xl font-black italic text-emerald-600">{settings.reminderFrequency} Attempts</span>
              </div>
              <input 
                type="range" min="1" max="5" step="1"
                value={settings.reminderFrequency}
                onChange={(e) => setSettings({...settings, reminderFrequency: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Maximum automated nudges sent before the system asks for your input.</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 p-14 rounded-[4rem] shadow-2xl space-y-12 text-white">
          <div className="flex items-center space-x-6">
            <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-white/10">
              <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Sovereign Vault</h3>
          </div>
          
          <div className="space-y-8">
            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 space-y-6">
               <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                 Vault is your local browser database. It is never uploaded to a cloud. "Export" creates a physical backup file. "Purge" wipes this device clean of all identities.
               </p>
               <div className="flex flex-col space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={onExport} className="py-6 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl">Export Vault</button>
                    <button onClick={onImport} className="py-6 bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Restore Vault</button>
                  </div>
                  <button onClick={onPurge} className="w-full py-6 border border-red-500/40 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Purge All Records (Wipe Device)</button>
               </div>
            </div>
          </div>
        </section>
      </div>

      <section className="bg-white p-16 rounded-[4rem] border border-slate-100 shadow-2xl space-y-12">
        <CalendarIntegrations 
          settings={settings}
          setSettings={setSettings}
        />
      </section>

      <section className="bg-slate-900 p-20 rounded-[5rem] text-white shadow-3xl text-center space-y-12 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
             <div className="flex flex-col items-center space-y-8 relative z-10">
               <div className="w-20 h-20 bg-emerald-600 rounded-[2.5rem] flex items-center justify-center italic font-black text-3xl shadow-2xl shadow-emerald-500/20">S</div>
               <div className="space-y-4">
                 <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-none text-white">Emergency Sanctuary</h3>
                 <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium italic">
                   Clear the deck when you feel overwhelmed. Select your level of sanctuary to reclaim your focus.
                 </p>
               </div>
               
               <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
                 <div className="w-full space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic block">Selective Sanctuary Mode</label>
                   <select 
                     value={sanctuaryLevel} 
                     onChange={(e) => setSanctuaryLevel(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-10 py-6 text-white font-black uppercase text-[12px] outline-none hover:bg-white/10 transition-all"
                   >
                     <option value="none" className="bg-slate-900">Choose level...</option>
                     <option value="soft" className="bg-slate-900">Soft Sanctuary (Mute Alarms)</option>
                     <option value="deep" className="bg-slate-900">Deep Sanctuary (Pause Loops)</option>
                     <option value="absolute" className="bg-slate-900">Absolute Sanctuary (Clear All)</option>
                   </select>
                 </div>
                 
                 <div className="flex flex-wrap justify-center gap-6">
                   <button 
                     onClick={() => applySanctuary(sanctuaryLevel)}
                     disabled={sanctuaryLevel === 'none'}
                     className="px-14 py-8 bg-emerald-600 rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 transition-transform active:scale-95 disabled:opacity-20 disabled:grayscale"
                   >
                     Initiate Sanctuary
                   </button>
                   <button onClick={() => alert("All active system pings silenced.")} className="px-14 py-8 bg-white/5 border border-white/10 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all">
                     Wipe Active Alarms
                   </button>
                 </div>
                 
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                    Selective sanctuary quietens system noise without deleting your sovereign patient records.
                 </p>
               </div>
             </div>
      </section>
    </div>
  );
};

export default Settings;
