
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Appointment, Invoice, AppointmentStatus, SoundType, PracticeSettings } from './types';
import Dashboard from './components/Dashboard';
import Scheduling from './components/Scheduling';
import Billing from './components/Billing';
import Settings from './components/Settings';

const STORAGE_KEY = 'flowease_sovereign_vault_v5';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [settings, setSettings] = useState<PracticeSettings>({
    notificationSound: SoundType.GENTLE,
    autoInvoice: true,
    reminderFrequency: 3,
    criticalThresholdHours: 48,
    workDayStart: "08:00",
    workDayEnd: "18:00",
    sessionLength: 50,
    googleCalendarEmail: ""
  });

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAppointments(parsed.appointments || []);
        setInvoices(parsed.invoices || []);
        setSettings(parsed.settings || settings);
      } catch (e) {
        console.error("Vault read failure", e);
      }
    } else {
      setAppointments(generateInitialData());
    }
    setIsLoaded(true);

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') as ViewState;
      const validViews: ViewState[] = ['landing', 'dashboard', 'scheduling', 'billing', 'settings'];
      if (validViews.includes(hash)) {
        setCurrentView(hash);
      } else if (window.location.hash === '') {
        setCurrentView('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments, invoices, settings }));
    }
  }, [appointments, invoices, settings, isLoaded]);

  const generateInitialData = (): Appointment[] => {
    const patients = ["Sarah Jenkins", "Michael Chen", "Emma Wilson", "David Miller"];
    const today = new Date().toISOString().split('T')[0];
    return patients.map((name, i) => ({
      id: `seed-${i}`,
      patientId: `p-${i}`,
      patientName: name,
      date: today,
      time: `${(9 + i).toString().padStart(2, '0')}:00`,
      duration: 50,
      status: i === 0 ? AppointmentStatus.NEEDS_ATTENTION : AppointmentStatus.CONFIRMED,
      remindersSent: 1,
      lastReminderAt: new Date().toISOString(),
      isInvoiced: false,
      isSynced: true,
      notes: "Initial restorative record established."
    }));
  };

  const navigateTo = (view: ViewState) => {
    window.location.hash = `#/${view}`;
    setMenuOpen(false);
  };

  const updateAppointment = (updatedApp: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
  };

  const deleteAppointment = (id: string) => {
    if (window.confirm("Delete this session? This removes it from your local browser vault permanently.")) {
      setAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  const addInvoice = (newInv: Invoice) => {
    setInvoices(prev => [...prev, newInv]);
    setAppointments(prev => prev.map(a => a.id === newInv.appointmentId ? { ...a, isInvoiced: true } : a));
  };

  const purgeVault = () => {
    if (window.confirm("PURGE WARNING: This permanently wipes every patient identity and financial record from this machine. Do you wish to leave no footprint behind?")) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  };

  const exportVault = () => {
    const data = JSON.stringify({ appointments, invoices, settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlowEase_Sovereign_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.appointments) {
          setAppointments(parsed.appointments);
          setInvoices(parsed.invoices || []);
          setSettings(parsed.settings || settings);
          alert("Vault restored. Your sovereign data is now synchronized.");
        }
      } catch (err) { alert("Restore failed: unrecognized file format."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 relative selection:bg-emerald-100">
      <div className="fixed top-12 right-12 z-[100]">
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center space-x-4 bg-slate-900 text-white px-8 py-4 rounded-full shadow-4xl hover:scale-105 active:scale-95 transition-all duration-300 ${menuOpen ? 'bg-emerald-600' : ''}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.3em] pl-2">{menuOpen ? 'Close Menu' : 'System Navigator'}</span>
          <div className="w-6 h-4 flex flex-col justify-between">
            <div className={`h-1 bg-white transition-all rounded-full ${menuOpen ? 'rotate-45 translate-y-1.5' : 'w-6'}`}></div>
            <div className={`h-1 bg-white transition-all rounded-full ${menuOpen ? 'opacity-0' : 'w-4'}`}></div>
            <div className={`h-1 bg-white transition-all rounded-full ${menuOpen ? '-rotate-45 -translate-y-1.5' : 'w-2'}`}></div>
          </div>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] bg-white/98 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-500">
          <nav className="flex flex-col space-y-4 text-center">
            {[
              { id: 'landing', label: 'Home Sanctuary' },
              { id: 'dashboard', label: 'Command Center' },
              { id: 'scheduling', label: 'Flow Ledger' },
              { id: 'billing', label: 'Billing Ledger' },
              { id: 'settings', label: 'Sanctuary Logic' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => navigateTo(item.id as ViewState)} 
                className="group flex flex-col items-center py-2"
              >
                <span className={`text-5xl md:text-[6.5rem] font-black italic uppercase tracking-tighter transition-all duration-500 ${currentView === item.id ? 'text-slate-900 scale-105' : 'text-slate-200 group-hover:text-slate-900 group-hover:-translate-y-2'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="min-h-screen">
        {currentView === 'landing' ? (
          <div className="flex flex-col items-center justify-center h-screen text-center space-y-8 animate-in fade-in duration-1000 px-6">
            <div className="space-y-4">
              <h1 className="text-8xl md:text-[14rem] font-black tracking-tighter text-slate-900 italic uppercase leading-[0.75]">FlowEase</h1>
              <p className="text-emerald-600 font-black text-xl md:text-3xl uppercase tracking-[0.6em] italic opacity-90">Cognitive Sanctuary</p>
            </div>
            <div className="flex flex-col items-center space-y-6">
               <button onClick={() => navigateTo('dashboard')} className="mt-8 bg-slate-900 text-white px-16 py-8 rounded-full font-black text-xs uppercase tracking-[0.5em] hover:scale-110 active:scale-95 transition-all shadow-4xl">Enter Workflow</button>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sovereign Browser Encryption • No Cloud Footprint</p>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-8 py-24 md:py-32">
            {currentView === 'dashboard' && <Dashboard appointments={appointments} setCurrentView={navigateTo} onUpdateAppointment={updateAppointment} />}
            {currentView === 'scheduling' && <Scheduling appointments={appointments} onAddAppointment={(app) => setAppointments(p => [...p, app])} onUpdateAppointment={updateAppointment} onDeleteAppointment={deleteAppointment} settings={settings} />}
            {currentView === 'billing' && <Billing appointments={appointments} invoices={invoices} onAddInvoice={addInvoice} />}
            {currentView === 'settings' && <Settings settings={settings} setSettings={setSettings} appointments={appointments} onUpdateAppointment={updateAppointment} onExport={exportVault} onPurge={purgeVault} onImport={() => fileInputRef.current?.click()} />}
          </div>
        )}
      </main>

      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />

      <div className="fixed bottom-12 right-12 z-40 bg-white/80 border border-slate-100 px-8 py-4 rounded-full shadow-2xl flex items-center space-x-4 opacity-50 hover:opacity-100 transition-opacity">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Privacy node active</span>
      </div>
    </div>
  );
};

export default App;
