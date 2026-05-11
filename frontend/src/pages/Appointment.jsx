import { useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { aiService } from '../services/aiService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, ChevronRight } from 'lucide-react';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const Appointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [step, setStep] = useState(1); // 1: symptoms, 2: pick doctor, 3: confirm
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    authService.getDoctors().then(r => setDoctors(r.data));
    api.get('/appointments/my').then(r => setAppointments(r.data));
  }, []);

  const runSymptomCheck = async () => {
    if (!symptoms.trim()) return toast.error('Please describe your symptoms');
    setAiLoading(true);
    try {
      const res = await aiService.checkSymptoms({ symptoms, age: user?.age, gender: user?.gender });
      setAiResult(res.data.result);
      setStep(2);
    } catch {
      toast.error('AI service unavailable');
    }
    setAiLoading(false);
  };

  const handleBook = async () => {
    if (!selectedDoctor || !date || !timeSlot) return toast.error('Please fill all details');
    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date, timeSlot, symptoms,
        aiSuggestion: aiResult.substring(0, 500),
        type: 'online',
      });
      toast.success('Appointment booked!');
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
      setStep(1);
      setSymptoms(''); setAiResult(''); setSelectedDoctor(null); setDate(''); setTimeSlot('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
    setBookingLoading(false);
  };

  const handleAction = async (id, action) => {
    if (action === 'cancelled') {
      await api.put(`/appointments/${id}`, { status: 'cancelled' });
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
      toast.success('Appointment cancelled');
    } else if (action === 'chat') {
      navigate(`/chat?room=${id}`);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">Book Appointment</h1>
      <p className="text-slate-500 mb-8">Our AI will check your symptoms and suggest the right specialist</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Booking flow */}
        <div className="space-y-6">
          {/* Step 1: Symptoms */}
          <div className={`card ${step === 1 ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
              <span className="font-semibold text-slate-700">Describe Symptoms</span>
              <Bot size={16} className="text-primary-500 ml-auto" />
            </div>
            <textarea
              rows={4}
              className="input resize-none"
              placeholder="e.g. I have a headache for 3 days, slight fever, and sore throat..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
            <button
              onClick={runSymptomCheck}
              disabled={aiLoading || !symptoms.trim()}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-2"
            >
              {aiLoading ? 'Analyzing...' : <><Sparkles size={15} /> Check with AI <ChevronRight size={15} /></>}
            </button>
          </div>

          {/* AI Result */}
          {aiResult && (
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={16} className="text-primary-600" />
                <span className="text-sm font-semibold text-primary-700">AI Analysis</span>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{aiResult}</p>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step >= 2 && (
            <div className={`card ${step === 2 ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="font-semibold text-slate-700">Select Doctor</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {doctors.map(doc => (
                  <button
                    key={doc._id}
                    onClick={() => { setSelectedDoctor(doc); setStep(3); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                      selectedDoctor?._id === doc._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-semibold text-slate-800">{doc.name}</p>
                    <p className="text-slate-500 text-xs">{doc.specialization} · {doc.experience} yrs exp · ₹{doc.consultationFee}</p>
                  </button>
                ))}
                {doctors.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No doctors registered yet</p>}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step >= 3 && selectedDoctor && (
            <div className="card ring-2 ring-primary-500">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">3</div>
                <span className="font-semibold text-slate-700">Date & Time</span>
              </div>
              <div className="mb-3">
                <label className="label">Select Date</label>
                <input type="date" className="input" min={minDate} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className="label">Select Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeSlot(t)}
                      className={`text-xs py-2 px-3 rounded-lg border transition-all ${
                        timeSlot === t ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 hover:border-primary-400 text-slate-600'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleBook} disabled={bookingLoading} className="btn-primary w-full mt-4">
                {bookingLoading ? 'Booking...' : 'Confirm Appointment'}
              </button>
            </div>
          )}
        </div>

        {/* My Appointments */}
        <div>
          <h2 className="font-semibold text-slate-700 mb-4">My Appointments</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {appointments.length === 0
              ? <p className="text-slate-400 text-sm text-center py-8 card">No appointments yet</p>
              : appointments.map(a => (
                  <AppointmentCard key={a._id} appointment={a} role="patient" onAction={handleAction} />
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
