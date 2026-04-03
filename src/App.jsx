import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ProfilePage from './pages/dashboard/ProfilePage';
import './styles/globals.css';

/* ─── Protected Route (redirects to /login if not authenticated) ─── */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <DashboardLayout />;
}

/* ─── Dashboard auto-redirect based on role ─── */
function DashboardRedirect() {
  const { user } = useAuth();
  const roleRoutes = {
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    admin: '/dashboard/admin',
  };
  const route = roleRoutes[user?.role] || '/login';
  return <Navigate to={route} replace />;
}

/* ─── Settings Page ─── */
function SettingsPage() {
  const { user } = useAuth();
  return (
    <div>
      <div style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '24px',
      }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>
          ⚙️ Settings
        </h3>

        {/* API Key */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>🔑 Claude API Key</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Add your Anthropic API key to enable real AI features. Without it, simulated responses are used.
          </p>
          <input
            type="password"
            placeholder="sk-ant-api..."
            defaultValue={localStorage.getItem('eduflow_api_key') || ''}
            onChange={(e) => {
              if (e.target.value) localStorage.setItem('eduflow_api_key', e.target.value);
              else localStorage.removeItem('eduflow_api_key');
            }}
            style={{
              width: '100%', padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {/* Profile */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>👤 Profile</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Name</label>
              <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', fontSize: '0.9rem' }}>
                {user?.name || 'User'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Role</label>
              <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                {user?.role || 'teacher'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</label>
              <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', fontSize: '0.9rem' }}>
                {user?.email || 'user@eduflow.ai'}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>🎨 Preferences</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Enable floating animations', 'Show particle background', 'Enable AI typewriter effect'].map(label => (
              <label key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-deep)', border: '1px solid var(--border-default)', cursor: 'pointer',
              }}>
                <span style={{ fontSize: '0.9rem' }}>{label}</span>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── App Routes ─── */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard — wraps DashboardLayout with auth check */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        {/* /dashboard → auto-redirect to /dashboard/:role */}
        <Route index element={<DashboardRedirect />} />

        {/* Role-specific dashboard routes */}
        <Route path="teacher" element={<TeacherDashboard />} />
        <Route path="student" element={<StudentDashboard />} />
        <Route path="admin" element={<AdminDashboard />} />

        {/* Shared routes */}
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Any unknown /dashboard/* → redirect to role dashboard */}
        <Route path="*" element={<DashboardRedirect />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ─── Root App ─── */
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
