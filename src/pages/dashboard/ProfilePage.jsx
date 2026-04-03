import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function ProfilePage() {
  const { user, getAuthHeaders, API_URL } = useAuth();
  const { success, info } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return info('Please fill all password fields.');
    }
    if (newPassword !== confirmPassword) {
      return info('New password and confirm password do not match.');
    }
    if (newPassword.length < 6) {
      return info('New password must be at least 6 characters.');
    }

    setSaving(true);
    try {
      const res = await axios.patch(
        `${API_URL}/profile/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: getAuthHeaders() }
      );
      success(res.data.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      info(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle = {
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '24px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg-deep)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
  };

  const roleColors = {
    admin: { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
    teacher: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
    student: { bg: 'rgba(6,182,212,0.12)', color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
  };

  const rc = roleColors[user?.role] || roleColors.student;

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, marginBottom: '24px' }}>
        Profile
      </h2>

      {/* User Info */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
          Account Information
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--violet))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '1.2rem', fontWeight: 700,
          }}>
            {(user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email || ''}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <div style={{ ...inputStyle, background: 'var(--bg-deep)', cursor: 'default', opacity: 0.8 }}>
              {user?.name || '—'}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{ ...inputStyle, background: 'var(--bg-deep)', cursor: 'default', opacity: 0.8 }}>
              {user?.email || '—'}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Role</label>
            <div style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: rc.bg,
              border: `1px solid ${rc.border}`,
              color: rc.color,
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {user?.role || 'unknown'}
            </div>
          </div>
          {user?.role === 'student' && (
            <div>
              <label style={labelStyle}>Class / Division</label>
              <div style={{ ...inputStyle, background: 'var(--bg-deep)', cursor: 'default', opacity: 0.8 }}>
                {user?.class || '—'} / {user?.division || '—'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              background: saving ? 'var(--bg-deep)' : 'linear-gradient(135deg, var(--primary), var(--violet))',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
