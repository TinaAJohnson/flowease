
import React, { useState } from 'react';
import { Appointment, Invoice, AppointmentStatus } from '../types';

interface BillingProps {
  appointments: Appointment[];
  invoices: Invoice[];
  onAddInvoice: (inv: Invoice) => void;
}

const Billing: React.FC<BillingProps> = ({ appointments, invoices, onAddInvoice }) => {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [amount, setAmount] = useState<number>(150.00);
  const [notes, setNotes] = useState<string>('');

  const uninvoicedConfirmed = appointments.filter(a => !a.isInvoiced);

  const exportBillingCSV = () => {
    const headers = ["Invoice ID", "Name", "Amount", "Date", "Status", "Notes"];
    const rows = invoices.map(i => [
      i.id,
      i.patientName,
      i.amount.toFixed(2),
      i.date,
      i.status,
      (i.notes || "").replace(/,/g, ";")
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `FlowEase_Billing_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateInvoice = () => {
    const app = appointments.find(a => a.id === selectedAppId);
    if (!app) return;
    onAddInvoice({
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      appointmentId: app.id,
      patientName: app.patientName,
      amount: amount,
      notes: notes || app.notes,
      date: new Date().toISOString().split('T')[0],
      status: 'Settled'
    });
    setShowNewInvoice(false);
    setSelectedAppId('');
    setAmount(150.00);
    setNotes('');
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-7xl md:text-[9rem] font-black text-slate-900 tracking-tighter uppercase italic leading-none">Billing Ledger</h2>
          <p className="text-xl text-slate-400 font-black uppercase tracking-[0.5em] italic">Rewards Register</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={exportBillingCSV} className="px-8 py-4 bg-white border border-slate-200 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all shadow-sm">Download Ledger</button>
          <button onClick={() => setShowNewInvoice(true)} className="px-14 py-7 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-4xl hover:scale-105 active:scale-95 transition-all">Settle New Cycle +</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden">
            <div className="px-16 py-12 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">Sanctuary Register</span>
              <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{invoices.length} Verified Records</span>
            </div>
            {invoices.length === 0 ? (
              <div className="text-center py-56 text-slate-400 italic font-black uppercase tracking-[0.4em] opacity-20">No settlements registered.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <div key={inv.id} className="px-16 py-16 hover:bg-slate-50/50 transition-all group">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="font-black text-4xl uppercase italic tracking-tighter text-slate-900 group-hover:text-emerald-600 transition-colors">{inv.patientName}</p>
                        <p className="text-[11px] font-black text-slate-400 uppercase mt-2 italic">Settled {inv.date} • ID: {inv.id}</p>
                      </div>
                      <p className="text-5xl font-black italic text-slate-900 tracking-tighter leading-none group-hover:scale-110 transition-transform">${inv.amount.toFixed(2)}</p>
                    </div>
                    {inv.notes && (
                      <div className="p-8 bg-white border-2 border-emerald-50 rounded-[2.5rem] flex flex-col space-y-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500/20"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Restorative Clarification:</span>
                        <p className="text-base text-slate-600 font-medium italic leading-relaxed">{inv.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 text-white p-14 rounded-[4rem] shadow-4xl space-y-10">
             <h3 className="font-black text-emerald-400 text-[11px] uppercase tracking-widest italic leading-none">Flow Revenue</h3>
             <div className="space-y-6">
                <div className="flex justify-between border-b border-white/10 pb-6">
                   <span className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic">Total Settlement</span>
                   <span className="text-6xl font-black italic tracking-tighter leading-none">${invoices.reduce((a,c) => a+c.amount, 0).toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                   <p className="text-[11px] text-slate-500 font-medium uppercase tracking-widest italic">Vault Synced Locally</p>
                   <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500"></div>
                   </div>
                </div>
             </div>
          </div>
          <div className="bg-emerald-50 p-12 rounded-[3rem] border-2 border-emerald-100 italic font-medium text-emerald-800 leading-relaxed text-lg shadow-sm">
             "Automated accounting preserves your heart's energy for the human connection."
          </div>
        </div>
      </div>

      {showNewInvoice && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-3xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] w-full max-w-xl p-20 shadow-4xl border border-slate-100 overflow-y-auto max-h-[95vh] custom-scrollbar">
            <h3 className="text-5xl font-black italic uppercase text-center mb-4 tracking-tighter leading-none">Settle flow cycle</h3>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center mb-14">Manual Ledger entry</p>
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Select Care connection</label>
                <select value={selectedAppId} onChange={e => setSelectedAppId(e.target.value)} className="w-full px-12 py-7 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-slate-900 outline-none focus:border-emerald-500 transition-all shadow-inner">
                  <option value="">Choose session...</option>
                  {uninvoicedConfirmed.map(a => <option key={a.id} value={a.id}>{a.patientName} — {a.date}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic text-center block">Reward amount ($)</label>
                <input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} className="w-full px-12 py-7 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] font-black text-5xl text-center outline-none focus:border-emerald-500 transition-all shadow-inner" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Settlement notes (Context)</label>
                <textarea placeholder="Manual clarification for the ledger..." value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-12 py-8 bg-slate-50 border-2 border-slate-100 rounded-[3rem] min-h-[140px] outline-none shadow-inner" />
              </div>
              <div className="space-y-6 pt-6">
                <button onClick={handleCreateInvoice} disabled={!selectedAppId} className="w-full py-9 bg-slate-900 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-4xl disabled:opacity-20 hover:bg-emerald-600 transition-all">Archive settlement</button>
                <button onClick={() => setShowNewInvoice(false)} className="w-full py-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors">Dismiss Ledger</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
