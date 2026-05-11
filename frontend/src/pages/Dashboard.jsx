import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Users, FileText, Clock, TrendingUp, Bot } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = user?.role === 'doctor' ? '/appointments/doctor' : '/appointments/my';
        const res = await api.get(endpoint);
        setAppointments(res.data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const confirmed = appointments.filter(a => a.status === 'confirmed').length;
  const completed = appointments.filter(a => a.status === 'completed').length;
  const recent = appointments.slice(0, 3);

  const isDoctor = user?.role === 'doctor';

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          {isDoctor
            ? `You have ${pending} pending appointments today.`
            : `Track your health journey and upcoming consultations.`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Calendar} label="Total" value={appointments.length} color="bg-primary-600" />
        <StatCard icon={Clock} label="Pending" value={pending} color="bg-yellow-500" />
        <StatCard icon={TrendingUp} label="Confirmed" value={confirmed} color="bg-blue-500" />
        <StatCard icon={FileText} label="Completed" value={completed} color="bg-emerald-500" />
      </div>

      {/* Quick actions */}
      {!isDoctor && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate('/appointments')}
            className="card hover:shadow-md transition-all cursor-pointer text-left group border-primary-100 hover:border-primary-300"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-600 transition-colors">
              <Calendar size={20} className="text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <p className="font-semibold text-slate-800">Book Appointment</p>
            <p className="text-sm text-slate-400 mt-1">Find a specialist and schedule a visit</p>
          </button>
          <button
            onClick={() => navigate('/symptom-checker')}
            className="card hover:shadow-md transition-all cursor-pointer text-left group border-emerald-100 hover:border-emerald-300"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-600 transition-colors">
              <Bot size={20} className="text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <p className="font-semibold text-slate-800">AI Symptom Checker</p>
            <p className="text-sm text-slate-400 mt-1">Describe symptoms and get AI guidance</p>
          </button>
        </div>
      )}

      {/* Recent appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Recent Appointments</h2>
          <button
            onClick={() => navigate(isDoctor ? '/doctor-panel' : '/appointments')}
            className="text-xs text-primary-600 font-medium hover:underline"
          >
            View all →
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No appointments yet.</p>
            {!isDoctor && (
              <button onClick={() => navigate('/appointments')} className="btn-primary mt-3 text-sm">
                Book your first appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map(apt => {
              const person = isDoctor ? apt.patientId : apt.doctorId;
              const statusColors = {
                pending: 'bg-yellow-100 text-yellow-800',
                confirmed: 'bg-blue-100 text-blue-800',
                completed: 'bg-green-100 text-green-800',
                cancelled: 'bg-red-100 text-red-800',
              };
              return (
                <div key={apt._id} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600">
                      {person?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{person?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400">{new Date(apt.date).toLocaleDateString('en-IN')} · {apt.timeSlot}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[apt.status]}`}>
                    {apt.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
