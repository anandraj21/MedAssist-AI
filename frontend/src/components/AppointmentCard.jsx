import { format } from 'date-fns';
import { Calendar, Clock, User, Stethoscope, Video } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const classes = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
  };
  return <span className={classes[status] || 'badge-pending'}>{status}</span>;
};

const AppointmentCard = ({ appointment, role, onAction }) => {
  const isDoctor = role === 'doctor';
  const person = isDoctor ? appointment.patientId : appointment.doctorId;
  const name = person?.name || 'N/A';
  const sub = isDoctor ? `Patient` : `Dr. — ${person?.specialization || 'General'}`;

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {isDoctor ? <User size={18} className="text-primary-600" /> : <Stethoscope size={18} className="text-primary-600" />}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{name}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {format(new Date(appointment.date), 'dd MMM yyyy')}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {appointment.timeSlot}
        </span>
        <span className="flex items-center gap-1">
          <Video size={12} />
          {appointment.type}
        </span>
      </div>

      {appointment.symptoms && (
        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mb-3 line-clamp-2">
          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
        </p>
      )}

      {onAction && (
        <div className="flex gap-2 mt-2">
          {appointment.status === 'pending' && isDoctor && (
            <button
              onClick={() => onAction(appointment._id, 'confirmed')}
              className="btn-primary text-xs py-1.5 px-3"
            >
              Confirm
            </button>
          )}
          {appointment.status === 'confirmed' && (
            <button
              onClick={() => onAction(appointment._id, 'chat')}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <Video size={12} /> Start Consultation
            </button>
          )}
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <button
              onClick={() => onAction(appointment._id, 'cancelled')}
              className="btn-outline text-xs py-1.5 px-3 border-red-300 text-red-500 hover:bg-red-50"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
