import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Toast from '../components/ui/Toast';

export default function Login() {
  const { login, loading } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('teacher');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      error('Please fill in all fields');
      return;
    }
    try {
      const userData = await login(form.email, form.password);
      success(`Welcome back! Logged in as ${userData.role}`);
      const roleRoutes = { teacher: '/dashboard/teacher', student: '/dashboard/student', admin: '/dashboard/admin' };
      navigate(roleRoutes[userData.role] || '/dashboard');
    } catch (err) {
      error(err.message || 'Login failed');
    }
  };

  const roles = [
    { key: 'teacher', label: 'Teacher', color: 'var(--primary)' },
    { key: 'student', label: 'Student', color: 'var(--cyan)' },
    { key: 'admin', label: 'Admin', color: 'var(--violet)' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-deep)',
    }}>
      <Toast />
      
      {/* Left Panel — Visual */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left-panel">
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent)',
          top: '20%', left: '20%',
          animation: 'float 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent)',
          bottom: '20%', right: '20%',
          animation: 'float 5s ease-in-out infinite 1s',
        }} />
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
            <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#FFC800" />
            <polygon points="50,60 42,75 58,75" fill="#FFC800" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '12px', color: '#fff' }}>
            Edubase
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
            Academic administration that transforms how education works
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInScale 0.5s var(--spring)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '28px' }}>Sign in to your account</p>

          {/* Role Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {roles.map(r => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: role === r.key ? `${r.color}15` : 'var(--bg-deep)',
                  border: `1px solid ${role === r.key ? `${r.color}40` : 'var(--border-default)'}`,
                  color: role === r.key ? r.color : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'all 0.3s var(--spring)',
                }}
              >{r.label}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@school.edu"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.3s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> Remember me
              </label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary-light)' }}>Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all 0.4s var(--spring)',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {loading && <div style={{
                width: 18, height: 18, border: '2px solid transparent', borderTop: '2px solid white',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />}
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          {/* Social Login */}
          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {['🔵 Google', '🟦 Microsoft'].map(provider => (
              <button key={provider} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-deep)', border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)', fontSize: '0.85rem',
                transition: 'all 0.3s',
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border-default)'}
              >{provider}</button>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign Up</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
