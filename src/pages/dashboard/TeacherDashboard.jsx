import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import TeacherCoPilot from '../../components/teacher/TeacherCoPilot';
import React from 'react';

// Lazy load grading components
const TeacherAssessmentForm = React.lazy(() => import('../../components/grading/TeacherAssessmentForm'));
const GradeReviewDashboard = React.lazy(() => import('../../components/grading/GradeReviewDashboard'));

export default function TeacherDashboard() {
  const { user, getAuthHeaders, API_URL, refreshUser } = useAuth();
  const { success, info } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(() => location.hash.replace('#', '') || 'overview');

  useEffect(() => {
    setActiveSection(location.hash.replace('#', '') || 'overview');
  }, [location.hash]);

  const handleTabChange = (tab) => {
    setActiveSection(tab);
    navigate(`#${tab}`, { replace: true });
  };

  const headers = getAuthHeaders();

  // Teacher's assigned class — read from user doc
  const tClass = user?.assignedClass || '';
  const tDiv = user?.assignedDivision || '';

  /* ── Shared styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.9rem' };
  const labelStyle = { fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 };
  const btnPrimary = { padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: 'white', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer' };
  const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', fontWeight: 600 };
  const tdStyle = { padding: '12px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-default)' };

  /* ── State ── */
  const [classInput, setClassInput] = useState(tClass);
  const [divInput, setDivInput] = useState(tDiv);
  const [students, setStudents] = useState([]);
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attRecords, setAttRecords] = useState({}); // { studentId: 'present'|'absent' }
  const [attAlreadySubmitted, setAttAlreadySubmitted] = useState(false);
  const [submittingAtt, setSubmittingAtt] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Assessments
  const [assessments, setAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);

  const [overview, setOverview] = useState({ totalStudents: 0, averageAttendance: 0, students: [] });

  const [timetableSlots, setTimetableSlots] = useState([]);

  const [leaves, setLeaves] = useState([]);
  const [leaveFilter, setLeaveFilter] = useState('');

  const cls = classInput || tClass;
  const div = divInput || tDiv;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  /* ── Mock data for offline mode ── */
  const MOCK_STUDENTS = [
    { _id: 'ms1', name: 'Aarav Sharma' }, { _id: 'ms2', name: 'Priya Patel' },
    { _id: 'ms3', name: 'Rohan Gupta' }, { _id: 'ms4', name: 'Ananya Singh' },
    { _id: 'ms5', name: 'Vikram Reddy' }, { _id: 'ms6', name: 'Sneha Joshi' },
    { _id: 'ms7', name: 'Arjun Mehta' }, { _id: 'ms8', name: 'Kavya Nair' },
  ];

  /* ── Fetchers ── */
  const syncAttendanceData = async () => {
    if (!cls || !div) return;
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        axios.get(`${API_URL}/teacher/students?class=${cls}&division=${div}`, { headers }),
        axios.get(`${API_URL}/teacher/attendance?date=${attDate}&class=${cls}&division=${div}`, { headers })
      ]);
      const studentList = studentsRes.data.data || [];
      const existingAttendance = attendanceRes.data.data || [];
      setStudents(studentList);
      const mappedRecords = {};
      studentList.forEach(s => {
        const record = existingAttendance.find(r => (r.studentId?._id || r.studentId) === s._id);
        mappedRecords[s._id] = record ? record.status : 'absent';
      });
      setAttRecords(mappedRecords);
      setAttAlreadySubmitted(existingAttendance.length > 0);
    } catch (err) {
      if (!err.response || err.code === 'ERR_NETWORK') {
        setStudents(MOCK_STUDENTS);
        const mockRecs = {};
        MOCK_STUDENTS.forEach((s, i) => { mockRecs[s._id] = i < 6 ? 'present' : 'absent'; });
        setAttRecords(mockRecs);
      }
      console.error('syncAttendanceData error:', err);
    }
  };

  const fetchAssessments = async () => {
    if (!cls || !div) return;
    try {
      const res = await axios.get(`${API_URL}/grading/assessment?class=${cls}&division=${div}`, { headers });
      setAssessments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchOverview = async () => {
    if (!cls || !div) return;
    try {
      const res = await axios.get(`${API_URL}/teacher/class-overview?class=${cls}&division=${div}`, { headers });
      setOverview(res.data.data || { totalStudents: 0, averageAttendance: 0, students: [] });
    } catch (err) {
      if (!err.response) setOverview({
        totalStudents: MOCK_STUDENTS.length, averageAttendance: 82,
        students: MOCK_STUDENTS.map((s, i) => ({ _id: s._id, name: s.name, present: 15 + i, absent: 3 - (i % 3), percentage: 75 + (i * 3) })),
      });
      console.error(err);
    }
  };

  const fetchTimetable = async () => {
    if (!cls || !div) return;
    try {
      const res = await axios.get(`${API_URL}/teacher/timetable?class=${cls}&division=${div}`, { headers });
      setTimetableSlots(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  // Sync profile on mount
  useEffect(() => {
    if (refreshUser) {
      refreshUser().catch(() => {});
    }
  }, []);

  const fetchLeaves = async () => {
    if (!cls || !div) return;
    try {
      const params = new URLSearchParams({ class: cls, division: div });
      if (leaveFilter) params.append('status', leaveFilter);
      const res = await axios.get(`${API_URL}/teacher/leaves?${params}`, { headers });
      setLeaves(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  // Synchronize dynamic data on class/division/date change
  useEffect(() => { 
    if (cls && div) { 
      syncAttendanceData(); 
      fetchOverview(); 
      fetchTimetable();
      fetchLeaves();
      fetchAssessments();
    } 
  }, [cls, div, attDate]); 

  const handleToggleSession = async () => {
    setSessionLoading(true);
    try {
      if (isSessionActive) {
        await axios.post(`${API_URL}/attendance/session/stop`, { class: cls, division: div }, { headers });
        success('Attendance session stopped.');
        setIsSessionActive(false);
      } else {
        await axios.post(`${API_URL}/attendance/session/start`, { class: cls, division: div }, { headers });
        success('Attendance session started! Students can now mark themselves.');
        setIsSessionActive(true);
      }
    } catch (err) {
      info(err.response?.data?.message || 'Failed to toggle session.');
    } finally {
      setSessionLoading(false);
    }
  };

  /* ── Handlers ── */
  const handleSubmitAttendance = async () => {
    if (students.length === 0) return info('No students loaded.');
    setSubmittingAtt(true);
    try {
      const records = students.map(s => ({
        studentId: s._id,
        status: attRecords[s._id] || 'absent',
      }));
      await axios.post(`${API_URL}/teacher/attendance`, {
        date: attDate, class: cls, division: div, records,
      }, { headers });
      success('Attendance saved successfully!');
      setAttAlreadySubmitted(true);
    } catch (err) {
      info(err.response?.data?.message || 'Failed to submit attendance.');
    } finally { setSubmittingAtt(false); }
  };

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await axios.patch(`${API_URL}/teacher/leaves/${leaveId}`, { status }, { headers });
      success(`Leave ${status}!`);
      fetchLeaves();
    } catch (err) {
      info(err.response?.data?.message || `Failed to ${status} leave.`);
    }
  };

  const handleSaveConfig = async () => {
    if (!classInput || !divInput) return info('Please enter Class and Division before saving.');
    try {
      await axios.post(`${API_URL}/teacher/config`, {
        assignedClass: classInput, assignedDivision: divInput
      }, { headers });
      success('Class assignment saved dynamically to your profile!');
    } catch (err) {
      info('Failed to save config.');
    }
  };

  const getSlot = (day, period) => timetableSlots.find(s => s.day === day && s.period === period);

  const presentCount = Object.values(attRecords).filter(v => v === 'present').length;
  const absentCount = students.length - presentCount;

  const tabs = ['overview', 'mark-attendance', 'assessments', 'class-overview', 'class-timetable', 'leave-applications'];

  const needsClassSetup = !cls || !div;

  return (
    <div>
      {/* Class Config Bar */}
      {needsClassSetup && (
        <div style={{ ...sectionStyle, borderLeft: '3px solid var(--warning)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Set your assigned class and division to get started:
          </span>
          <input value={classInput} onChange={e => setClassInput(e.target.value)} placeholder="Class (e.g. 10)" style={{ ...inputStyle, width: '120px' }} />
          <input value={divInput} onChange={e => setDivInput(e.target.value)} placeholder="Division (e.g. A)" style={{ ...inputStyle, width: '120px' }} />
          <button onClick={handleSaveConfig} style={btnPrimary}>Save Default</button>
        </div>
      )}

      {!needsClassSetup && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Class:</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{cls} / {div}</span>
          <button onClick={() => { setClassInput(''); setDivInput(''); }} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'none', textDecoration: 'underline', cursor: 'pointer', border: 'none' }}>Change</button>
          <button onClick={handleSaveConfig} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', textDecoration: 'underline', cursor: 'pointer', border: 'none' }}>Save as Default</button>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, color: 'var(--primary)' },
          { label: 'Present Today', value: presentCount, color: 'var(--emerald)' },
          { label: 'Absent Today', value: absentCount, color: 'var(--danger)' },
          { label: 'Leave Requests', value: leaves.length, color: 'var(--warning)' },
        ].map((card, i) => (
          <div key={i} style={{ ...sectionStyle, marginBottom: 0, textAlign: 'center', borderLeft: `3px solid ${card.color}` }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{card.label}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => handleTabChange(tab)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-full)',
            background: activeSection === tab ? 'linear-gradient(135deg, var(--primary), var(--violet))' : 'var(--bg-card)',
            border: activeSection === tab ? 'none' : '1px solid var(--border-default)',
            color: activeSection === tab ? 'white' : 'var(--text-secondary)',
            fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize',
            transition: 'all 0.3s var(--spring)', cursor: 'pointer',
          }}>{tab.replace(/-/g, ' ')}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeSection === 'overview' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Teacher Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Welcome, {user?.name || 'Teacher'}. You are assigned to Class {cls} Division {div}. Use the tabs above to mark attendance, view class overview, see the timetable, and manage leave applications.
          </p>
        </div>
      )}

      {/* ═══ MARK ATTENDANCE ═══ */}
      {activeSection === 'mark-attendance' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>
              Mark Attendance — Class {cls} / {div}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Date:</label>
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
            </div>
          </div>

          {attAlreadySubmitted && (
            <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '16px' }}>
              Attendance already submitted for {attDate}. You can update it by re-submitting.
            </div>
          )}

          {/* Automated Attendance Controls */}
          <div style={{ ...sectionStyle, background: 'var(--bg-deep)', marginBottom: '24px', borderLeft: `4px solid ${isSessionActive ? 'var(--emerald)' : 'var(--text-muted)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Automated Attendance Session</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {isSessionActive 
                    ? 'Session is LIVE. Students can mark attendance via Face ID or IP Check.' 
                    : 'Start a session to allow students to mark themselves present.'}
                </p>
              </div>
              <button 
                onClick={handleToggleSession} 
                disabled={sessionLoading}
                style={{ 
                  ...btnPrimary, 
                  background: isSessionActive ? 'var(--danger)' : 'var(--emerald)',
                  opacity: sessionLoading ? 0.7 : 1
                }}
              >
                {sessionLoading ? 'Please wait...' : (isSessionActive ? 'Stop Session' : 'Start Session')}
              </button>
            </div>
          </div>

          {students.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students found for Class {cls} / {div}.</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button onClick={() => {
                  const updated = {};
                  students.forEach(s => { updated[s._id] = 'present'; });
                  setAttRecords(updated);
                }} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  Mark All Present
                </button>
                <button onClick={() => {
                  const updated = {};
                  students.forEach(s => { updated[s._id] = 'absent'; });
                  setAttRecords(updated);
                }} style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                  Mark All Absent
                </button>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const status = attRecords[s._id] || 'absent';
                    return (
                      <tr key={s._id}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: 'white', fontSize: '0.65rem', fontWeight: 700,
                            }}>{(s.name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
                            <span style={{ fontWeight: 500 }}>{s.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setAttRecords(prev => ({ ...prev, [s._id]: 'present' }))} style={{
                              padding: '6px 16px', borderRadius: 'var(--radius-full)',
                              background: status === 'present' ? 'rgba(16,185,129,0.2)' : 'var(--bg-deep)',
                              border: `1px solid ${status === 'present' ? '#10b981' : 'var(--border-default)'}`,
                              color: status === 'present' ? '#10b981' : 'var(--text-muted)',
                              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}>Present</button>
                            <button onClick={() => setAttRecords(prev => ({ ...prev, [s._id]: 'absent' }))} style={{
                              padding: '6px 16px', borderRadius: 'var(--radius-full)',
                              background: status === 'absent' ? 'rgba(244,63,94,0.2)' : 'var(--bg-deep)',
                              border: `1px solid ${status === 'absent' ? '#f43f5e' : 'var(--border-default)'}`,
                              color: status === 'absent' ? '#f43f5e' : 'var(--text-muted)',
                              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            }}>Absent</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button onClick={handleSubmitAttendance} disabled={submittingAtt} style={{ ...btnPrimary, marginTop: '16px', opacity: submittingAtt ? 0.6 : 1 }}>
                {submittingAtt ? 'Saving...' : 'Submit Attendance'}
              </button>
            </>
          )}
        </div>
      )}

      {/* ═══ CLASS OVERVIEW ═══ */}
      {activeSection === 'class-overview' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
            Class Overview — {cls} / {div}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Students</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>{overview.totalStudents}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Average Attendance</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--emerald)' }}>{overview.averageAttendance}%</div>
            </div>
          </div>

          {overview.students && overview.students.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student', 'Present Days', 'Absent Days', 'Attendance %'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {overview.students.map(s => (
                  <tr key={s._id}>
                    <td style={tdStyle}>{s.name}</td>
                    <td style={tdStyle}><span style={{ color: 'var(--emerald)', fontWeight: 600 }}>{s.present}</span></td>
                    <td style={tdStyle}><span style={{ color: 'var(--danger)', fontWeight: 600 }}>{s.absent}</span></td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-deep)', maxWidth: '100px' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: s.percentage >= 75 ? '#10b981' : '#f43f5e', width: `${s.percentage}%`, transition: 'width 0.5s' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: s.percentage >= 75 ? 'var(--emerald)' : 'var(--danger)' }}>{s.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No attendance data available yet.</p>
          )}
        </div>
      )}

      {/* ═══ CLASS TIMETABLE ═══ */}
      {activeSection === 'class-timetable' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
            Class Timetable — {cls} / {div}
          </h3>
          {timetableSlots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No timetable configured for this class yet. Ask your admin to set it up.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: '80px' }}>Period</th>
                    {days.map(d => <th key={d} style={thStyle}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(p => (
                    <tr key={p}>
                      <td style={{ ...tdStyle, fontWeight: 600, textAlign: 'center' }}>P{p}</td>
                      {days.map(d => {
                        const slot = getSlot(d, p);
                        return (
                          <td key={d} style={{ ...tdStyle, fontSize: '0.8rem' }}>
                            {slot ? (
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{slot.subject}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.teacherId?.name || ''}</div>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══ LEAVE APPLICATIONS ═══ */}
      {activeSection === 'leave-applications' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>
              Leave Applications — {cls} / {div}
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['', 'pending', 'approved', 'rejected'].map(f => (
                <button key={f} onClick={() => setLeaveFilter(f)} style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  background: leaveFilter === f ? 'var(--primary)' : 'var(--bg-deep)',
                  border: leaveFilter === f ? 'none' : '1px solid var(--border-default)',
                  color: leaveFilter === f ? 'white' : 'var(--text-muted)',
                  fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                }}>{f || 'All'}</button>
              ))}
            </div>
          </div>

          {leaves.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No leave applications found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Student', 'From', 'To', 'Reason', 'Status', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => {
                  const statusColors = { pending: '#f59e0b', approved: '#10b981', rejected: '#f43f5e' };
                  return (
                    <tr key={l._id}>
                      <td style={tdStyle}>{l.studentId?.name || '—'}</td>
                      <td style={tdStyle}>{new Date(l.fromDate).toLocaleDateString()}</td>
                      <td style={tdStyle}>{new Date(l.toDate).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                          background: `${statusColors[l.status]}15`, color: statusColors[l.status],
                          textTransform: 'capitalize',
                        }}>{l.status}</span>
                      </td>
                      <td style={tdStyle}>
                        {l.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleLeaveAction(l._id, 'approved')} style={{
                              padding: '4px 12px', borderRadius: 'var(--radius-md)',
                              background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                              color: '#10b981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            }}>Approve</button>
                            <button onClick={() => handleLeaveAction(l._id, 'rejected')} style={{
                              padding: '4px 12px', borderRadius: 'var(--radius-md)',
                              background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)',
                              color: '#f43f5e', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            }}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══ ASSESSMENTS (FEATURE 2) ═══ */}
      {activeSection === 'assessments' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>Assessments & Grading</h3>
            <button 
              onClick={() => { setShowAssessmentForm(!showAssessmentForm); setSelectedAssessment(null); }} 
              style={btnPrimary}
            >
              {showAssessmentForm ? 'View List' : '+ New Assessment'}
            </button>
          </div>

          <React.Suspense fallback={<p>Loading...</p>}>
            {showAssessmentForm ? (
              <TeacherAssessmentForm onComplete={() => { setShowAssessmentForm(false); fetchAssessments(); }} />
            ) : selectedAssessment ? (
              <div>
                <button onClick={() => setSelectedAssessment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '15px' }}>← Back to List</button>
                <GradeReviewDashboard assessmentId={selectedAssessment._id} />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {assessments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)' }}>No assessments created yet.</p>
                ) : (
                  assessments.map(ass => (
                    <div key={ass._id} style={{ ...sectionStyle, background: 'var(--bg-deep)', cursor: 'pointer' }} onClick={() => setSelectedAssessment(ass)}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{ass.title}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0' }}>{ass.subject} | Due: {new Date(ass.dueDate).toLocaleDateString()}</p>
                      <div style={{ marginTop: '12px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                        Review Submissions →
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </React.Suspense>
        </div>
      )}

      {/* AI Co-pilot Assistant */}
      <TeacherCoPilot 
        students={students} 
        overview={overview} 
        activeSection={activeSection} 
      />
    </div>
  );
}
