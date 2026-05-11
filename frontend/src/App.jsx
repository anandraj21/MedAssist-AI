import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import DoctorPanel from './pages/DoctorPanel';
import ChatPage from './pages/ChatPage';
import Prescriptions from './pages/Prescriptions';
import SymptomChecker from './pages/SymptomChecker';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="flex">
    <Sidebar />
    <main className="flex-1 overflow-y-auto min-h-[calc(100vh-57px)]">
      {children}
    </main>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-medium' }} />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Navbar />
            <AppLayout><Dashboard /></AppLayout>
            <ChatBot />
          </ProtectedRoute>
        } />

        <Route path="/appointments" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Navbar />
            <AppLayout><Appointment /></AppLayout>
            <ChatBot />
          </ProtectedRoute>
        } />

        <Route path="/symptom-checker" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Navbar />
            <AppLayout><SymptomChecker /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/doctor-panel" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <Navbar />
            <AppLayout><DoctorPanel /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <Navbar />
            <AppLayout><ChatPage /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/prescriptions" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Navbar />
            <AppLayout><Prescriptions /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
