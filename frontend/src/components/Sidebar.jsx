import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, MessageSquare, FileText,
  Users, Settings, Bot
} from 'lucide-react';

const patientLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/symptom-checker', icon: Bot, label: 'AI Symptom Checker' },
  { to: '/chat', icon: MessageSquare, label: 'Consultations' },
  { to: '/prescriptions', icon: FileText, label: 'Prescriptions' },
];

const doctorLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/doctor-panel', icon: Users, label: 'My Patients' },
  { to: '/chat', icon: MessageSquare, label: 'Consultations' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className="w-60 bg-white border-r border-slate-100 min-h-[calc(100vh-57px)] flex flex-col">
      <div className="p-4 flex-1">
        {/* Role badge */}
        <div className={`mb-6 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider ${
          user?.role === 'doctor'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-primary-50 text-primary-700'
        }`}>
          {user?.role === 'doctor' ? '👨‍⚕️ Doctor Portal' : '🧑 Patient Portal'}
        </div>

        <nav className="space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Settings size={17} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
