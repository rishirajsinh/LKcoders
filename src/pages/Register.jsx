import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Toast from '../components/ui/Toast';

export default function Register() {
  const { register, loading } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    role: 'teacher', institution: '', department: '',
    password: '', confirmPassword: '', agreeTerms: false,
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.email || !form.phone)) {
      error('Please fill in all fields'); return;
    }
    if (step === 2 && !form.institution) {
      error('Please fill in institution details'); return;
    }
    setStep(s => Math.min(s + 1, 3));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      error('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      error('Password must be at least 6 characters'); return;
    }
    try {
      const userData = await register(form);
      success('Account created successfully! 🎉');
      const roleRoutes = { teacher: '/dashboard/teacher', student: '/dashboard/student', admin: '/dashboard/admin' };
      navigate(roleRoutes[userData.role] || '/dashboard');
    } catch (err) {
      error(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)',
    border: '1px solid var(--border-default)', color: 'var(--text-primary)',
    fontSize: '0.9rem', transition: 'border-color 0.3s',
  };

  const labelStyle = { fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-deep)', padding: '40px 20px',
      position: 'relative', overflow: 'hidden',
    }}>
      <Toast />

      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)', top: '-10%', right: '-10%', animation: 'float 8s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent)', bottom: '-5%', left: '-5%', animation: 'float 6s ease-in-out infinite 2s' }} />

      <div style={{
        width: '100%', maxWidth: '520px', padding: '40px',
        borderRadius: 'var(--radius-xl)', background: 'var(--bg-card)',
        border: '1px solid var(--border-default)', backdropFilter: 'blur(20px)',
        animation: 'fadeInScale 0.5s var(--spring)', position: 'relative', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 100 100" width="56" height="56" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
            <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#FFC800" />
            <polygon points="50,60 42,75 58,75" fill="#FFC800" />
          </svg>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join Edubase in minutes</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? 'linear-gradient(135deg, var(--primary), var(--violet))' : 'var(--bg-deep)',
                border: `2px solid ${step >= s ? 'var(--primary)' : 'var(--border-default)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: step >= s ? 'white' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 700,
                transition: 'all 0.4s var(--spring)',
                animation: step === s ? 'glowPulse 2s ease-in-out infinite' : 'none',
              }}>{step > s ? '✓' : s}</div>
              {s < 3 && (
                <div style={{
                  width: 40, height: 2,
                  background: step > s ? 'var(--primary)' : 'var(--border-default)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full Name</label>
                <input value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="John Doe" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="you@school.edu" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="+91 9876543210" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
            </div>
          )}

          {/* Step 2: Role & Institution */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Select Role</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { key: 'teacher', label: 'Teacher', color: 'var(--primary)' },
                    { key: 'student', label: 'Student', color: 'var(--cyan)' },
                    { key: 'admin', label: 'Admin', color: 'var(--violet)' },
                  ].map(r => (
                    <button key={r.key} type="button" onClick={() => updateForm('role', r.key)} style={{
                      flex: 1, padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: form.role === r.key ? `${r.color}15` : 'var(--bg-deep)',
                      border: `2px solid ${form.role === r.key ? r.color : 'var(--border-default)'}`,
                      color: form.role === r.key ? r.color : 'var(--text-muted)',
                      fontSize: '0.8rem', fontWeight: 600,
                      transition: 'all 0.3s var(--spring)',
                    }}>{r.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Institution</label>
                <input value={form.institution} onChange={e => updateForm('institution', e.target.value)} placeholder="Delhi Public School" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Department / Class</label>
                <input value={form.department} onChange={e => updateForm('department', e.target.value)} placeholder="Mathematics / Class 10A" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
            </div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Password</label>
                <input type="password" value={form.password} onChange={e => updateForm('password', e.target.value)} placeholder="Min 6 characters" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} placeholder="Re-enter password" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.agreeTerms} onChange={e => updateForm('agreeTerms', e.target.checked)} style={{ accentColor: 'var(--primary)' }} />
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {step > 1 && (
              <button type="button" onClick={prevStep} style={{
                flex: 1, padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.95rem',
                transition: 'all 0.3s',
              }}>← Back</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep} style={{
                flex: 1, padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                color: 'white', fontWeight: 600, fontSize: '0.95rem',
                transition: 'all 0.4s var(--spring)',
              }}>Next →</button>
            ) : (
              <button type="submit" disabled={loading} style={{
                flex: 1, padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                color: 'white', fontWeight: 600, fontSize: '0.95rem',
                opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                {loading && <div style={{ width: 18, height: 18, border: '2px solid transparent', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {loading ? 'Creating...' : 'Create Account 🚀'}
              </button>
            )}
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
