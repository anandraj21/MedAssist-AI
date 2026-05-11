import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';
import { Stethoscope } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'patient',
    specialization: '', consultationFee: 500, experience: 0
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const specializations = [
    'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
    'Orthopedic', 'Pediatrician', 'Psychiatrist', 'ENT Specialist',
    'Ophthalmologist', 'Gynecologist', 'Urologist', 'Endocrinologist',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.register(form);
      login(res.data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Stethoscope size={22} className="text-white" />
          </div>
          <span className="font-display text-2xl font-semibold">MedAssist AI</span>
        </div>

        <div className="card">
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-slate-500 text-sm mb-6">Join thousands on India's smartest healthcare platform</p>

          {/* Role toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {['patient', 'doctor'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  form.role === r ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500'
                }`}
              >
                {r === 'doctor' ? '👨‍⚕️ I\'m a Doctor' : '🧑 I\'m a Patient'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Dr. Arun Kumar / Priya Sharma"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>

            {form.role === 'doctor' && (
              <>
                <div>
                  <label className="label">Specialization</label>
                  <select className="input" value={form.specialization}
                    onChange={e => setForm({ ...form, specialization: e.target.value })} required>
                    <option value="">Select specialization</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Experience (years)</label>
                    <input type="number" className="input" min="0" max="50"
                      value={form.experience} onChange={e => setForm({ ...form, experience: +e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Consultation Fee (₹)</label>
                    <input type="number" className="input" min="100"
                      value={form.consultationFee} onChange={e => setForm({ ...form, consultationFee: +e.target.value })} />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
