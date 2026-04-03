import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function StudentDashboard() {
  const { user, getAuthHeaders, API_URL } = useAuth();
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
  const studentId = user?._id || '';
  const cls = user?.class || '';
  const div = user?.division || '';

  /* ── Shared styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.9rem' };
  const labelStyle = { fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 };
  const btnPrimary = { padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--cyan), var(--emerald))', color: 'white', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer' };
  const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', fontWeight: 600 };
  const tdStyle = { padding: '12px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-default)' };

  /* ── State ── */
  // Attendance
  const [attData, setAttData] = useState({ records: [], totalPresent: 0, totalAbsent: 0, total: 0, percentage: 0 });

  // Timetable
  const [timetableSlots, setTimetableSlots] = useState([]);

  // Results
  const [results, setResults] = useState({ results: [], overallPercentage: 0 });

  // Leave
  const [leaveForm, setLeaveForm] = useState({ reason: '', fromDate: '', toDate: '' });
  const [myLeaves, setMyLeaves] = useState([]);
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Bulk JSON Import
  const [bulkImportForm, setBulkImportForm] = useState({ modelName: 'Result', rawJson: '' });
  const [bulkImporting, setBulkImporting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  /* ── Fetchers ── */
  const fetchAttendance = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_URL}/student/attendance/${studentId}`, { headers });
      setAttData(res.data.data || { records: [], totalPresent: 0, totalAbsent: 0, total: 0, percentage: 0 });
    } catch (err) { console.error(err); }
  };

  const fetchTimetable = async () => {
    if (!cls || !div) return;
    try {
      const res = await axios.get(`${API_URL}/student/timetable?class=${cls}&division=${div}`, { headers });
      setTimetableSlots(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchResults = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_URL}/student/results/${studentId}`, { headers });
      setResults(res.data.data || { results: [], overallPercentage: 0 });
    } catch (err) { console.error(err); }
  };

  const fetchLeaves = async () => {
    if (!studentId) return;
    try {
      const res = await axios.get(`${API_URL}/student/leaves/${studentId}`, { headers });
      setMyLeaves(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (studentId) { fetchAttendance(); fetchLeaves(); }
  }, [studentId]);
  useEffect(() => { if (activeSection === 'my-timetable') fetchTimetable(); }, [activeSection, cls, div]);
  useEffect(() => { if (activeSection === 'my-results') fetchResults(); }, [activeSection, studentId]);

  /* ── Handlers ── */
  const handleSubmitLeave = async () => {
    if (!leaveForm.reason.trim()) return info('Reason is required.');
    if (!leaveForm.fromDate || !leaveForm.toDate) return info('Both dates are required.');
    if (new Date(leaveForm.fromDate) > new Date(leaveForm.toDate)) return info('From date must be on or before To date.');

    setSubmittingLeave(true);
    try {
      await axios.post(`${API_URL}/student/leave`, {
        reason: leaveForm.reason, fromDate: leaveForm.fromDate, toDate: leaveForm.toDate,
      }, { headers });
      success('Leave application submitted!');
      setLeaveForm({ reason: '', fromDate: '', toDate: '' });
      fetchLeaves();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to submit leave.');
    } finally { setSubmittingLeave(false); }
  };

  const handleBulkImport = async () => {
    if (!bulkImportForm.rawJson.trim()) return info('JSON payload is required.');
    let dataToImport = [];
    try {
      dataToImport = JSON.parse(bulkImportForm.rawJson);
    } catch (err) {
      return info('Invalid JSON format.');
    }

    if (!Array.isArray(dataToImport)) return info('JSON payload must be an array of objects.');

    setBulkImporting(true);
    try {
      const res = await axios.post(`${API_URL}/student/bulk-import`, {
        modelName: bulkImportForm.modelName,
        data: dataToImport
      }, { headers });
      success(res.data.message || 'Import successful!');
      setBulkImportForm({ ...bulkImportForm, rawJson: '' });
      if (bulkImportForm.modelName === 'Result') fetchResults();
      if (bulkImportForm.modelName === 'Attendance') fetchAttendance();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to import data.');
    } finally {
      setBulkImporting(false);
    }
  };

  const getSlot = (day, period) => timetableSlots.find(s => s.day === day && s.period === period);

  // Build monthly calendar for attendance
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const calDays = [];
  for (let i = 0; i < firstDay; i++) calDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calDays.push(d);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getAttStatusForDay = (day) => {
    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attData.records.find(r => r.date === dateStr);
    return record ? record.status : null;
  };

  const tabs = ['overview', 'my-attendance', 'my-timetable', 'my-results', 'leave-apply', 'raw-json'];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Attendance', value: `${attData.percentage}%`, color: attData.percentage >= 75 ? 'var(--emerald)' : 'var(--danger)' },
          { label: 'Present Days', value: attData.totalPresent, color: 'var(--cyan)' },
          { label: 'Absent Days', value: attData.totalAbsent, color: 'var(--danger)' },
          { label: 'Leave Requests', value: myLeaves.length, color: 'var(--warning)' },
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
            background: activeSection === tab ? 'linear-gradient(135deg, var(--cyan), var(--emerald))' : 'var(--bg-card)',
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Student Dashboard</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Welcome, {user?.name || 'Student'}. Class {cls || '—'} / Division {div || '—'}. Use the tabs above to view your attendance, timetable, results, and submit leave applications.
          </p>
        </div>
      )}

      {/* ═══ MY ATTENDANCE ═══ */}
      {activeSection === 'my-attendance' && (
        <>
          {/* Summary */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Attendance Summary</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Present</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--emerald)' }}>{attData.totalPresent}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Absent</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>{attData.totalAbsent}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Percentage</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: attData.percentage >= 75 ? 'var(--emerald)' : 'var(--danger)' }}>{attData.percentage}%</div>
              </div>
            </div>
          </div>

          {/* Monthly Calendar */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>
                {monthNames[calMonth - 1]} {calYear}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Prev</button>
                <button onClick={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#10b981', display: 'inline-block' }}></span> Present
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#f43f5e', display: 'inline-block' }}></span> Absent
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, padding: '8px 0' }}>{d}</div>
              ))}
              {calDays.map((day, i) => {
                const status = day ? getAttStatusForDay(day) : null;
                let bg = 'var(--bg-deep)';
                let color = 'var(--text-muted)';
                if (status === 'present') { bg = 'rgba(16,185,129,0.2)'; color = '#10b981'; }
                else if (status === 'absent') { bg = 'rgba(244,63,94,0.2)'; color = '#f43f5e'; }
                return (
                  <div key={i} style={{
                    minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    background: day ? bg : 'transparent',
                    border: day ? '1px solid var(--border-default)' : 'none',
                    fontSize: '0.85rem', fontWeight: status ? 600 : 400, color,
                  }}>
                    {day || ''}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ MY TIMETABLE ═══ */}
      {activeSection === 'my-timetable' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>
            My Timetable — Class {cls} / {div}
          </h3>
          {!cls || !div ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Your class/division is not set. Contact admin.</p>
          ) : timetableSlots.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No timetable configured yet.</p>
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
                                <div style={{ fontWeight: 600, color: 'var(--cyan)' }}>{slot.subject}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.teacherId?.name || ''}</div>
                              </div>
                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
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

      {/* ═══ MY RESULTS ═══ */}
      {activeSection === 'my-results' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>My Results</h3>

          {/* Overall */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Percentage</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, color: 'var(--cyan)' }}>{results.overallPercentage}%</div>
          </div>

          {results.results.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results available yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Subject', 'Marks Obtained', 'Total Marks', 'Grade', 'Exam Type', 'Date'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{r.subject}</td>
                    <td style={tdStyle}><span style={{ fontWeight: 600, color: 'var(--primary)' }}>{r.marksObtained}</span></td>
                    <td style={tdStyle}>{r.totalMarks}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>{r.grade}</span>
                    </td>
                    <td style={tdStyle}>{r.examType}</td>
                    <td style={tdStyle}>{new Date(r.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ═══ LEAVE APPLICATION ═══ */}
      {activeSection === 'leave-apply' && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Apply for Leave</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Reason *</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Enter reason for leave"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>From Date *</label>
                  <input type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>To Date *</label>
                  <input type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <button onClick={handleSubmitLeave} disabled={submittingLeave} style={{ ...btnPrimary, opacity: submittingLeave ? 0.6 : 1 }}>
                {submittingLeave ? 'Submitting...' : 'Apply for Leave'}
              </button>
            </div>
          </div>

          {/* Past Applications */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>My Leave Applications ({myLeaves.length})</h3>
            {myLeaves.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No leave applications submitted yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['From', 'To', 'Reason', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {myLeaves.map(l => {
                    const statusColors = { pending: '#f59e0b', approved: '#10b981', rejected: '#f43f5e' };
                    return (
                      <tr key={l._id}>
                        <td style={tdStyle}>{new Date(l.fromDate).toLocaleDateString()}</td>
                        <td style={tdStyle}>{new Date(l.toDate).toLocaleDateString()}</td>
                        <td style={{ ...tdStyle, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                        <td style={tdStyle}>
                          <span style={{
                            padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600,
                            background: `${statusColors[l.status]}15`, color: statusColors[l.status],
                            textTransform: 'capitalize',
                          }}>{l.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ═══ RAW JSON IMPORT ═══ */}
      {activeSection === 'raw-json' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Bulk JSON Data Importer (Student)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Warning: This allows manual JSON uploads for your Records (Results/Attendance). Data must match backend schemas closely.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Target Collection</label>
              <select 
                value={bulkImportForm.modelName} 
                onChange={e => setBulkImportForm({ ...bulkImportForm, modelName: e.target.value })} 
                style={inputStyle}
              >
                <option value="Result">Result</option>
                <option value="Attendance">Attendance</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Raw JSON Array Input</label>
              <textarea
                value={bulkImportForm.rawJson}
                onChange={e => setBulkImportForm({ ...bulkImportForm, rawJson: e.target.value })}
                placeholder={`[\n  { "studentId": "${studentId}", "subject": "Math", "marksObtained": 85, "totalMarks": 100, "grade": "A" }\n]`}
                rows={12}
                style={{ ...inputStyle, fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>
            <button 
              onClick={handleBulkImport} 
              disabled={bulkImporting}
              style={{ ...btnPrimary, alignSelf: 'flex-start', opacity: bulkImporting ? 0.6 : 1 }}
            >
              {bulkImporting ? 'Importing...' : 'Execute JSON Import'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
