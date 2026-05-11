import { useState, useEffect } from 'react';
import api from '../services/api';
import { aiService } from '../services/aiService';
import AppointmentCard from '../components/AppointmentCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, X } from 'lucide-react';

const DoctorPanel = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [prescription, setPrescription] = useState({
    diagnosis: '', doctorNotes: '', followUpDate: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }]
  });
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    api.get('/appointments/doctor').then(r => setAppointments(r.data));
  }, []);

  const handleAction = async (id, action) => {
    if (action === 'confirmed') {
      await api.put(`/appointments/${id}`, { status: 'confirmed' });
      toast.success('Appointment confirmed');
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } else if (action === 'cancelled') {
      await api.put(`/appointments/${id}`, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } else if (action === 'chat') {
      navigate(`/chat?room=${id}`);
    }
  };

  const addMedicine = () => {
    setPrescription(p => ({ ...p, medicines: [...p.medicines, { name: '', dosage: '', frequency: '', duration: '' }] }));
  };

  const removeMedicine = (i) => {
    setPrescription(p => ({ ...p, medicines: p.medicines.filter((_, idx) => idx !== i) }));
  };

  const updateMedicine = (i, field, val) => {
    setPrescription(p => {
      const m = [...p.medicines];
      m[i] = { ...m[i], [field]: val };
      return { ...p, medicines: m };
    });
  };

  const generateSummary = async () => {
    if (!selected || !prescription.diagnosis) return toast.error('Please fill diagnosis first');
    setSummaryLoading(true);
    try {
      const res = await aiService.summarize({
        symptoms: selected.symptoms,
        diagnosis: prescription.diagnosis,
        doctorNotes: prescription.doctorNotes,
        medicines: prescription.medicines,
      });
      setAiSummary(res.data.summary);
    } catch {
      toast.error('AI unavailable');
    }
    setSummaryLoading(false);
  };

  const savePrescription = async () => {
    if (!selected) return;
    setSaveLoading(true);
    try {
      await api.post(`/appointments/${selected._id}/prescription`, { ...prescription, aiSummary });
      toast.success('Prescription saved!');
      setSelected(null);
      setAiSummary('');
      const res = await api.get('/appointments/doctor');
      setAppointments(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaveLoading(false);
  };

  const pending = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');
  const completed = appointments.filter(a => a.status === 'completed');

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Doctor Panel</h1>
      <p className="text-slate-500 mb-8">Manage your patients and appointments</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Appointments */}
        <div className="space-y-6">
          {[
            { label: '⏳ Pending Requests', items: pending },
            { label: '✅ Confirmed Today', items: confirmed },
            { label: '🏁 Completed', items: completed },
          ].map(({ label, items }) => (
            <div key={label}>
              <h2 className="font-semibold text-slate-700 text-sm mb-3">{label} ({items.length})</h2>
              {items.length === 0
                ? <p className="text-slate-400 text-xs card text-center py-4">None</p>
                : items.map(apt => (
                  <div key={apt._id} className="mb-3">
                    <AppointmentCard appointment={apt} role="doctor" onAction={handleAction} />
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => setSelected(apt)}
                        className="w-full mt-1 btn-outline text-xs py-1.5 border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      >
                        + Write Prescription
                      </button>
                    )}
                  </div>
                ))
              }
            </div>
          ))}
        </div>

        {/* Right: Prescription writer */}
        <div>
          {selected ? (
            <div className="card sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Write Prescription</h2>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs">
                <p className="font-medium text-slate-700">Patient: {selected.patientId?.name}</p>
                <p className="text-slate-500 mt-1">Symptoms: {selected.symptoms || 'Not specified'}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Diagnosis</label>
                  <input className="input" placeholder="Primary diagnosis" value={prescription.diagnosis}
                    onChange={e => setPrescription(p => ({ ...p, diagnosis: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Doctor's Notes</label>
                  <textarea rows={3} className="input resize-none" placeholder="Clinical notes and observations..."
                    value={prescription.doctorNotes}
                    onChange={e => setPrescription(p => ({ ...p, doctorNotes: e.target.value }))} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Medicines</label>
                    <button onClick={addMedicine} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  {prescription.medicines.map((m, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 mb-2 bg-slate-50 p-2 rounded-xl">
                      <input className="input text-xs py-2" placeholder="Medicine name" value={m.name} onChange={e => updateMedicine(i, 'name', e.target.value)} />
                      <input className="input text-xs py-2" placeholder="Dosage (e.g. 500mg)" value={m.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                      <input className="input text-xs py-2" placeholder="Frequency (e.g. Twice daily)" value={m.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} />
                      <div className="flex gap-1">
                        <input className="input text-xs py-2 flex-1" placeholder="Duration (7 days)" value={m.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} />
                        {prescription.medicines.length > 1 && (
                          <button onClick={() => removeMedicine(i)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="label">Follow-up Date</label>
                  <input type="date" className="input" value={prescription.followUpDate}
                    onChange={e => setPrescription(p => ({ ...p, followUpDate: e.target.value }))} />
                </div>

                <button onClick={generateSummary} disabled={summaryLoading} className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
                  <Sparkles size={14} /> {summaryLoading ? 'Generating...' : 'Generate AI Summary'}
                </button>

                {aiSummary && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-xs text-slate-700">
                    <p className="font-semibold text-primary-700 mb-1">AI Patient Summary:</p>
                    {aiSummary}
                  </div>
                )}

                <button onClick={savePrescription} disabled={saveLoading} className="btn-primary w-full py-3">
                  {saveLoading ? 'Saving...' : '💊 Save Prescription & Complete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card text-center py-16 text-slate-400">
              <Sparkles size={32} className="mx-auto mb-3 text-slate-300" />
              <p>Select a confirmed appointment<br />to write a prescription</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPanel;
