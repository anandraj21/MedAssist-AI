import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { FileText, Pill, Calendar, User } from 'lucide-react';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/appointments/prescriptions').then(r => {
      setPrescriptions(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Medical Records</h1>
      <p className="text-slate-500 mb-8">Your prescriptions and consultation history</p>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : prescriptions.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p>No prescriptions yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-3">
            {prescriptions.map(p => (
              <button
                key={p._id}
                onClick={() => setSelected(p)}
                className={`card w-full text-left transition-all hover:shadow-md ${selected?._id === p._id ? 'ring-2 ring-primary-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{p.doctorId?.name}</p>
                      <p className="text-xs text-slate-400">{p.doctorId?.specialization}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(p.createdAt), 'dd MMM yyyy')}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">🩺 {p.diagnosis || 'General Consultation'}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {p.medicines?.length || 0} medicine(s) prescribed
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="card sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-800">Prescription Details</h2>
                <span className="text-xs text-slate-400">{format(new Date(selected.createdAt), 'dd MMM yyyy, HH:mm')}</span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Doctor</p>
                  <p className="font-semibold text-slate-800">{selected.doctorId?.name}</p>
                  <p className="text-sm text-slate-500">{selected.doctorId?.specialization}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Diagnosis</p>
                  <p className="text-sm text-slate-800 font-medium">{selected.diagnosis || '—'}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Doctor's Notes</p>
                  <p className="text-sm text-slate-700">{selected.doctorNotes || '—'}</p>
                </div>

                {selected.medicines?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1"><Pill size={12} /> Medicines</p>
                    <div className="space-y-2">
                      {selected.medicines.map((m, i) => (
                        <div key={i} className="bg-blue-50 rounded-xl p-3 text-sm">
                          <p className="font-semibold text-blue-800">{m.name} — {m.dosage}</p>
                          <p className="text-blue-600 text-xs mt-0.5">{m.frequency} · {m.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.followUpDate && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-yellow-50 rounded-xl p-3">
                    <Calendar size={15} className="text-yellow-600" />
                    <span>Follow-up: <strong>{format(new Date(selected.followUpDate), 'dd MMM yyyy')}</strong></span>
                  </div>
                )}

                {selected.aiSummary && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-primary-700 mb-1">🤖 AI Summary</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{selected.aiSummary}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center text-slate-400 min-h-48">
              <div className="text-center">
                <FileText size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Select a prescription to view details</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
