import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useLocalStorage from '../../hooks/useLocalStorage';

/* ---- SVG Icon Components ---- */
const icons = {
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>,
  attendance: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  students: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  timetable: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>,
  subject: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  report: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  leave: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15h6"/></svg>,
  results: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  profile: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  addUser: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  classOverview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  warning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  medal: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  announce: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>,
};

const teacherMenu = [
  { icon: icons.overview, label: 'Overview', path: '/dashboard/teacher' },
  { icon: icons.attendance, label: 'Mark Attendance', path: '/dashboard/teacher', hash: 'mark-attendance' },
  { icon: icons.classOverview, label: 'Class Overview', path: '/dashboard/teacher', hash: 'class-overview' },
  { icon: icons.timetable, label: 'Class Timetable', path: '/dashboard/teacher', hash: 'class-timetable' },
  { icon: icons.leave, label: 'Leave Applications', path: '/dashboard/teacher', hash: 'leave-applications' },
  { icon: icons.report, label: 'Marks Management', path: '/dashboard/academics' },
  { icon: icons.profile, label: 'Profile', path: '/dashboard/profile' },
  { icon: icons.settings, label: 'Settings', path: '/dashboard/settings' },
];

const studentMenu = [
  { icon: icons.overview, label: 'Overview', path: '/dashboard/student' },
  { icon: icons.attendance, label: 'My Attendance', path: '/dashboard/student', hash: 'my-attendance' },
  { icon: icons.timetable, label: 'My Timetable', path: '/dashboard/student', hash: 'my-timetable' },
  { icon: icons.results, label: 'My Results', path: '/dashboard/student', hash: 'my-results' },
  { icon: icons.leave, label: 'Apply for Leave', path: '/dashboard/student', hash: 'leave-apply' },
  { icon: icons.profile, label: 'Profile', path: '/dashboard/profile' },
  { icon: icons.settings, label: 'Settings', path: '/dashboard/settings' },
];

const adminMenu = [
  { icon: icons.overview, label: 'Overview', path: '/dashboard/admin' },
  { icon: icons.addUser, label: 'Add Student', path: '/dashboard/admin', hash: 'add-student' },
  { icon: icons.subject, label: 'Subject Assignment', path: '/dashboard/admin', hash: 'subject-assignment' },
  { icon: icons.attendance, label: 'Attendance', path: '/dashboard/admin', hash: 'attendance' },
  { icon: icons.timetable, label: 'Timetable', path: '/dashboard/admin', hash: 'timetable' },
  { icon: icons.calendar, label: 'Academic Calendar', path: '/dashboard/admin', hash: 'calendar' },
  { icon: icons.profile, label: 'Profile', path: '/dashboard/profile' },
  { icon: icons.settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useLocalStorage('eduflow_sidebar_collapsed', false);
  const location = useLocation();

  const role = user?.role || 'teacher';
  const menu = role === 'student' ? studentMenu : role === 'admin' ? adminMenu : teacherMenu;

  const roleColors = {
    teacher: 'var(--primary)',
    student: 'var(--cyan)',
    admin: 'var(--violet)',
  };

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-default)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s var(--smooth)',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Logo Area */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border-default)',
        minHeight: '72px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#FFC800" />
            <polygon points="50,60 42,75 58,75" fill="#FFC800" />
          </svg>
        </div>
        {!collapsed && (
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}>Edubase</span>
        )}
      </div>

      {/* Role Badge */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 20px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          padding: collapsed ? '6px' : '6px 16px',
          borderRadius: 'var(--radius-full)',
          background: `${roleColors[role]}15`,
          border: `1px solid ${roleColors[role]}40`,
          color: roleColors[role],
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          whiteSpace: 'nowrap',
          textAlign: 'center',
        }}>
          {collapsed ? role[0].toUpperCase() : role}
        </div>
      </div>

      {/* Menu Items */}
      <nav style={{
        flex: 1,
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto',
      }}>
        {menu.map((item, idx) => {
          const isActive = item.hash
            ? location.pathname === item.path && location.hash === `#${item.hash}`
            : location.pathname === item.path && (!location.hash || location.hash === '#overview');

          return (
            <NavLink
              key={item.label + idx}
              to={item.hash ? `${item.path}#${item.hash}` : item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '12px 16px' : '10px 16px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? `${roleColors[role]}15` : 'transparent',
                border: isActive ? `1px solid ${roleColors[role]}30` : '1px solid transparent',
                transition: 'all 0.3s var(--smooth)',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                justifyContent: collapsed ? 'center' : 'flex-start',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: '60%',
                  borderRadius: '0 4px 4px 0',
                  background: roleColors[role],
                }} />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-default)',
      }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          width: '100%',
          padding: '10px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          transition: 'all 0.3s var(--smooth)',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {collapsed ? '>' : '< Collapse'}
        </button>
      </div>
    </aside>
  );
}
