import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function AdminDashboard() {
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

  /* ── Shared styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.9rem' };
  const labelStyle = { fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: 500 };
  const btnPrimary = { padding: '10px 20px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: 'white', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer' };
  const btnDanger = { padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' };
  const thStyle = { padding: '12px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', fontWeight: 600 };
  const tdStyle = { padding: '12px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-default)' };

  /* ══════════════════════════════════
     DATA STATE
  ══════════════════════════════════ */
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, records: [] });
  const [timetableSlots, setTimetableSlots] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // Add Student form
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', class: '', division: '' });
  const [studentSearch, setStudentSearch] = useState('');

  // Add Teacher form
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '' });
  const [teacherSearch, setTeacherSearch] = useState('');

  // Subject Assignment form
  const [assignForm, setAssignForm] = useState({ teacherId: '', class: '', division: '', subject: '' });
  const subjectOptions = ['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Physics', 'Chemistry'];

  // Attendance filter
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attClass, setAttClass] = useState('');
  const [attDiv, setAttDiv] = useState('');

  // Timetable filter
  const [ttClass, setTtClass] = useState('');
  const [ttDiv, setTtDiv] = useState('');
  const [editSlot, setEditSlot] = useState(null);
  const [editForm, setEditForm] = useState({ subject: '', teacherId: '' });
  const [addSlotForm, setAddSlotForm] = useState({ class: '', division: '', day: 'Monday', period: 1, subject: '', teacherId: '' });

  // Calendar
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [newEvent, setNewEvent] = useState({ title: '', date: '', type: 'Event', description: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Bulk JSON Import
  const [bulkImportForm, setBulkImportForm] = useState({ modelName: 'User', rawJson: '' });
  const [bulkImporting, setBulkImporting] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  /* ── Data fetchers ── */
  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/students`, { headers });
      setStudents(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/teachers`, { headers });
      setTeachers(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/assignments`, { headers });
      setAssignments(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams({ date: attDate });
      if (attClass) params.append('class', attClass);
      if (attDiv) params.append('division', attDiv);
      const res = await axios.get(`${API_URL}/admin/attendance/summary?${params}`, { headers });
      setAttendanceSummary(res.data.data || { present: 0, absent: 0, records: [] });
    } catch (err) { console.error(err); }
  };

  const fetchTimetable = async () => {
    if (!ttClass || !ttDiv) return;
    try {
      const res = await axios.get(`${API_URL}/admin/timetable?class=${ttClass}&division=${ttDiv}`, { headers });
      setTimetableSlots(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCalendar = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/calendar?month=${calMonth}&year=${calYear}`, { headers });
      setCalendarEvents(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoadingData(true);
    Promise.all([fetchStudents(), fetchTeachers()]).finally(() => setLoadingData(false));
  }, []);

  useEffect(() => { if (activeSection === 'subject-assignment') fetchAssignments(); }, [activeSection]);
  useEffect(() => { if (activeSection === 'attendance') fetchAttendance(); }, [activeSection, attDate, attClass, attDiv]);
  useEffect(() => { if (activeSection === 'timetable') fetchTimetable(); }, [activeSection, ttClass, ttDiv]);
  useEffect(() => { if (activeSection === 'calendar') fetchCalendar(); }, [activeSection, calMonth, calYear]);

  /* ── Handlers ── */
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password) return info('Name, email, and password are required.');
    try {
      await axios.post(`${API_URL}/admin/add-student`, {
        name: newStudent.name, email: newStudent.email, password: newStudent.password,
        class: newStudent.class, division: newStudent.division,
      }, { headers });
      success('Student added successfully!');
      setNewStudent({ name: '', email: '', password: '', class: '', division: '' });
      fetchStudents();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to add student.');
    }
  };

  const handleAddTeacher = async () => {
    if (!newTeacher.name || !newTeacher.email || !newTeacher.password) return info('Name, email, and password are required.');
    try {
      await axios.post(`${API_URL}/admin/add-teacher`, {
        name: newTeacher.name, email: newTeacher.email, password: newTeacher.password,
      }, { headers });
      success('Teacher added successfully!');
      setNewTeacher({ name: '', email: '', password: '' });
      fetchTeachers();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to add teacher.');
    }
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
      const res = await axios.post(`${API_URL}/admin/bulk-import`, {
        modelName: bulkImportForm.modelName,
        data: dataToImport
      }, { headers });
      success(res.data.message || 'Import successful!');
      setBulkImportForm({ ...bulkImportForm, rawJson: '' });
      if (['User', 'Student', 'Teacher'].includes(bulkImportForm.modelName)) {
        fetchStudents();
        fetchTeachers();
      }
    } catch (err) {
      info(err.response?.data?.message || 'Failed to import data.');
    } finally {
      setBulkImporting(false);
    }
  };

  const handleAssignSubject = async () => {
    if (!assignForm.teacherId || !assignForm.class || !assignForm.division || !assignForm.subject) return info('All fields are required.');
    try {
      await axios.post(`${API_URL}/admin/assign-subject`, {
        teacherId: assignForm.teacherId, class: assignForm.class,
        division: assignForm.division, subject: assignForm.subject,
      }, { headers });
      success('Subject assigned!');
      setAssignForm({ teacherId: '', class: '', division: '', subject: '' });
      fetchAssignments();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to assign subject.');
    }
  };

  const handleRemoveAssignment = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/remove-subject/${id}`, { headers });
      success('Assignment removed.');
      fetchAssignments();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to remove.');
    }
  };

  const handleUpdateSlot = async () => {
    if (!editForm.subject || !editForm.teacherId) return info('Subject and teacher are required.');
    try {
      await axios.put(`${API_URL}/admin/timetable/${editSlot._id}`, { subject: editForm.subject, teacherId: editForm.teacherId }, { headers });
      success('Timetable slot updated!');
      setEditSlot(null);
      fetchTimetable();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to update slot.');
    }
  };

  const handleAddSlot = async () => {
    const f = addSlotForm;
    if (!f.class || !f.division || !f.day || !f.period || !f.subject || !f.teacherId) return info('All fields are required.');
    try {
      await axios.post(`${API_URL}/admin/timetable`, {
        class: f.class, division: f.division, day: f.day, period: f.period, subject: f.subject, teacherId: f.teacherId
      }, { headers });
      success('Timetable slot added!');
      setTtClass(f.class); setTtDiv(f.division);
      setAddSlotForm({ ...addSlotForm, subject: '', teacherId: '' });
      fetchTimetable();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to add slot.');
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.type) return info('Title, date, and type are required.');
    try {
      await axios.post(`${API_URL}/admin/calendar`, newEvent, { headers });
      success('Event added!');
      setNewEvent({ title: '', date: '', type: 'Event', description: '' });
      fetchCalendar();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to add event.');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/admin/calendar/${id}`, { headers });
      success('Event deleted.');
      setSelectedEvent(null);
      fetchCalendar();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  // Timetable grid helper
  const getSlot = (day, period) => timetableSlots.find(s => s.day === day && s.period === period);

  // Calendar grid helpers
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfMonth = new Date(calYear, calMonth - 1, 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const getEventsForDay = (day) => {
    return calendarEvents.filter(ev => {
      const evDate = new Date(ev.date);
      return evDate.getDate() === day && evDate.getMonth() + 1 === calMonth && evDate.getFullYear() === calYear;
    });
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredTeachers = teachers.filter(t =>
    (t.name || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const tabs = ['overview', 'add-student', 'add-teacher', 'subject-assignment', 'attendance', 'timetable', 'calendar', 'raw-json'];

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: students.length, color: 'var(--primary)' },
          { label: 'Total Teachers', value: teachers.length, color: 'var(--violet)' },
          { label: 'Assignments', value: assignments.length, color: 'var(--cyan)' },
          { label: 'Calendar Events', value: calendarEvents.length, color: 'var(--emerald)' },
        ].map((card, i) => (
          <div key={i} style={{
            ...sectionStyle, marginBottom: 0, textAlign: 'center',
            borderLeft: `3px solid ${card.color}`,
          }}>
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
            background: activeSection === tab ? 'linear-gradient(135deg, var(--violet), var(--primary))' : 'var(--bg-card)',
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
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
            Admin Dashboard Overview
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Welcome, {user?.name || 'Admin'}. Use the tabs above to manage students, assign subjects, view attendance, configure the timetable, and manage the academic calendar. All data is persisted in MongoDB.
          </p>
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Students in Database</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>{students.length}</div>
            </div>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Teachers in Database</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>{teachers.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ADD STUDENT ═══ */}
      {activeSection === 'add-student' && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Add New Student</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="John Doe" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@school.edu" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input value={newStudent.password} onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} placeholder="Min 6 characters" type="password" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Class</label>
                <input value={newStudent.class} onChange={e => setNewStudent({ ...newStudent, class: e.target.value })} placeholder="10" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Division</label>
                <input value={newStudent.division} onChange={e => setNewStudent({ ...newStudent, division: e.target.value })} placeholder="A" style={inputStyle} />
              </div>
            </div>
            <button onClick={handleAddStudent} style={{ ...btnPrimary, marginTop: '16px' }}>Add Student</button>
          </div>

          {/* Student Table */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>All Students ({students.length})</h3>
              <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search students..." style={{ ...inputStyle, width: '240px' }} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Class', 'Division'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No students found.</td></tr>
                  ) : filteredStudents.map(s => (
                    <tr key={s._id}>
                      <td style={tdStyle}>{s.name}</td>
                      <td style={tdStyle}>{s.email}</td>
                      <td style={tdStyle}>{s.class || '—'}</td>
                      <td style={tdStyle}>{s.division || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ ADD TEACHER ═══ */}
      {activeSection === 'add-teacher' && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Add New Teacher</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={newTeacher.name} onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })} placeholder="Jane Smith" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input value={newTeacher.email} onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })} placeholder="teacher@school.edu" type="email" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input value={newTeacher.password} onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })} placeholder="Min 6 characters" type="password" style={inputStyle} />
              </div>
            </div>
            <button onClick={handleAddTeacher} style={{ ...btnPrimary, marginTop: '16px' }}>Add Teacher</button>
          </div>

          {/* Teacher Table */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>All Teachers ({teachers.length})</h3>
              <input value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} placeholder="Search teachers..." style={{ ...inputStyle, width: '240px' }} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Name', 'Email'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr><td colSpan={2} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No teachers found.</td></tr>
                  ) : filteredTeachers.map(t => (
                    <tr key={t._id}>
                      <td style={tdStyle}>{t.name}</td>
                      <td style={tdStyle}>{t.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ SUBJECT ASSIGNMENT ═══ */}
      {activeSection === 'subject-assignment' && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Assign Subject to Teacher</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Teacher *</label>
                <select value={assignForm.teacherId} onChange={e => setAssignForm({ ...assignForm, teacherId: e.target.value })} style={inputStyle}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subject *</label>
                <select value={assignForm.subject} onChange={e => setAssignForm({ ...assignForm, subject: e.target.value })} style={inputStyle}>
                  <option value="">Select Subject</option>
                  {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Class *</label>
                <input value={assignForm.class} onChange={e => setAssignForm({ ...assignForm, class: e.target.value })} placeholder="10" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Division *</label>
                <input value={assignForm.division} onChange={e => setAssignForm({ ...assignForm, division: e.target.value })} placeholder="A" style={inputStyle} />
              </div>
            </div>
            <button onClick={handleAssignSubject} style={{ ...btnPrimary, marginTop: '16px' }}>Assign Subject</button>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Existing Assignments ({assignments.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Teacher', 'Class', 'Division', 'Subject', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {assignments.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)' }}>No assignments yet.</td></tr>
                  ) : assignments.map(a => (
                    <tr key={a._id}>
                      <td style={tdStyle}>{a.teacherId?.name || '—'} ({a.teacherId?.email || ''})</td>
                      <td style={tdStyle}>{a.class}</td>
                      <td style={tdStyle}>{a.division}</td>
                      <td style={tdStyle}>{a.subject}</td>
                      <td style={tdStyle}>
                        <button onClick={() => handleRemoveAssignment(a._id)} style={btnDanger}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══ ATTENDANCE OVERVIEW ═══ */}
      {activeSection === 'attendance' && (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ ...sectionStyle, marginBottom: 0, textAlign: 'center', borderLeft: '3px solid var(--emerald)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Present Today</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--emerald)' }}>{attendanceSummary.present}</div>
            </div>
            <div style={{ ...sectionStyle, marginBottom: 0, textAlign: 'center', borderLeft: '3px solid var(--danger)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Absent Today</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--danger)' }}>{attendanceSummary.absent}</div>
            </div>
          </div>

          {/* Filters */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Filter Attendance</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} style={{ ...inputStyle, width: '180px' }} />
              </div>
              <div>
                <label style={labelStyle}>Class</label>
                <input value={attClass} onChange={e => setAttClass(e.target.value)} placeholder="e.g. 10" style={{ ...inputStyle, width: '120px' }} />
              </div>
              <div>
                <label style={labelStyle}>Division</label>
                <input value={attDiv} onChange={e => setAttDiv(e.target.value)} placeholder="e.g. A" style={{ ...inputStyle, width: '120px' }} />
              </div>
            </div>

            {attendanceSummary.records && attendanceSummary.records.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Student Name', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.records.map((r, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{r.studentName}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600,
                          background: r.status === 'present' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                          color: r.status === 'present' ? '#10b981' : '#f43f5e',
                        }}>{r.status === 'present' ? 'Present' : 'Absent'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No attendance records for the selected filters.</p>
            )}
          </div>
        </>
      )}

      {/* ═══ TIMETABLE ═══ */}
      {activeSection === 'timetable' && (
        <>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Timetable Management</h3>

            {/* View Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={labelStyle}>Class *</label>
                <input value={ttClass} onChange={e => setTtClass(e.target.value)} placeholder="10" style={{ ...inputStyle, width: '120px' }} />
              </div>
              <div>
                <label style={labelStyle}>Division *</label>
                <input value={ttDiv} onChange={e => setTtDiv(e.target.value)} placeholder="A" style={{ ...inputStyle, width: '120px' }} />
              </div>
              <button onClick={fetchTimetable} style={btnPrimary}>Load Timetable</button>
            </div>

            {ttClass && ttDiv && (
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
                            <td key={d} style={{ ...tdStyle, fontSize: '0.8rem', cursor: 'pointer', position: 'relative' }}
                              onClick={() => {
                                if (slot) {
                                  setEditSlot(slot);
                                  setEditForm({ subject: slot.subject, teacherId: slot.teacherId?._id || slot.teacherId || '' });
                                }
                              }}
                            >
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
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>Click a filled slot to edit it.</p>
              </div>
            )}
          </div>

          {/* Add Slot Form */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Add / Update Timetable Slot</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div><label style={labelStyle}>Class</label><input value={addSlotForm.class} onChange={e => setAddSlotForm({ ...addSlotForm, class: e.target.value })} placeholder="10" style={inputStyle} /></div>
              <div><label style={labelStyle}>Division</label><input value={addSlotForm.division} onChange={e => setAddSlotForm({ ...addSlotForm, division: e.target.value })} placeholder="A" style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Day</label>
                <select value={addSlotForm.day} onChange={e => setAddSlotForm({ ...addSlotForm, day: e.target.value })} style={inputStyle}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Period</label>
                <select value={addSlotForm.period} onChange={e => setAddSlotForm({ ...addSlotForm, period: parseInt(e.target.value) })} style={inputStyle}>
                  {periods.map(p => <option key={p} value={p}>Period {p}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={addSlotForm.subject} onChange={e => setAddSlotForm({ ...addSlotForm, subject: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Teacher</label>
                <select value={addSlotForm.teacherId} onChange={e => setAddSlotForm({ ...addSlotForm, teacherId: e.target.value })} style={inputStyle}>
                  <option value="">Select</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleAddSlot} style={{ ...btnPrimary, marginTop: '16px' }}>Add Slot</button>
          </div>

          {/* Edit Modal */}
          {editSlot && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
              onClick={(e) => { if (e.target === e.currentTarget) setEditSlot(null); }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', width: '400px', maxWidth: '90vw' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Edit Slot: {editSlot.day} Period {editSlot.period}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })} style={inputStyle}>
                      {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Teacher</label>
                    <select value={editForm.teacherId} onChange={e => setEditForm({ ...editForm, teacherId: e.target.value })} style={inputStyle}>
                      <option value="">Select</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button onClick={handleUpdateSlot} style={btnPrimary}>Save Changes</button>
                  <button onClick={() => setEditSlot(null)} style={{ ...btnDanger, background: 'var(--bg-deep)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ ACADEMIC CALENDAR ═══ */}
      {activeSection === 'calendar' && (
        <>
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>
                Academic Calendar — {monthNames[calMonth - 1]} {calYear}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { if (calMonth === 1) { setCalMonth(12); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Prev</button>
                <button onClick={() => { if (calMonth === 12) { setCalMonth(1); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
                  style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', cursor: 'pointer' }}>Next</button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '24px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, padding: '8px 0' }}>{d}</div>
              ))}
              {calendarDays.map((day, i) => {
                const evts = day ? getEventsForDay(day) : [];
                const typeColors = { Holiday: '#f43f5e', Exam: '#f59e0b', Event: '#6366f1' };
                return (
                  <div key={i} style={{
                    minHeight: '64px', padding: '4px', borderRadius: 'var(--radius-sm)',
                    background: day ? 'var(--bg-deep)' : 'transparent',
                    border: day ? '1px solid var(--border-default)' : 'none',
                    cursor: evts.length > 0 ? 'pointer' : 'default',
                  }} onClick={() => { if (evts.length > 0) setSelectedEvent(evts[0]); }}>
                    {day && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{day}</div>}
                    {evts.map((ev, j) => (
                      <div key={j} style={{
                        fontSize: '0.65rem', padding: '2px 4px', borderRadius: '3px',
                        background: `${typeColors[ev.type] || '#6366f1'}20`,
                        color: typeColors[ev.type] || '#6366f1',
                        fontWeight: 600, marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{ev.title}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Event */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Add Event</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><label style={labelStyle}>Title *</label><input value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title" style={inputStyle} /></div>
              <div><label style={labelStyle}>Date *</label><input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select value={newEvent.type} onChange={e => setNewEvent({ ...newEvent, type: e.target.value })} style={inputStyle}>
                  <option value="Event">Event</option>
                  <option value="Holiday">Holiday</option>
                  <option value="Exam">Exam</option>
                </select>
              </div>
              <div><label style={labelStyle}>Description</label><input value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Optional" style={inputStyle} /></div>
            </div>
            <button onClick={handleAddEvent} style={{ ...btnPrimary, marginTop: '16px' }}>Add Event</button>
          </div>

          {/* Event Detail Modal */}
          {selectedEvent && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null); }}>
              <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', width: '400px', maxWidth: '90vw' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '12px' }}>{selectedEvent.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Date: {new Date(selectedEvent.date).toLocaleDateString()}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Type: {selectedEvent.type}</p>
                {selectedEvent.description && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{selectedEvent.description}</p>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleDeleteEvent(selectedEvent._id)} style={btnDanger}>Delete Event</button>
                  <button onClick={() => setSelectedEvent(null)} style={{ ...btnDanger, background: 'var(--bg-deep)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ RAW JSON IMPORT ═══ */}
      {activeSection === 'raw-json' && (
        <div style={sectionStyle}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Bulk JSON Data Importer</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            Warning: This feature allows raw JSON injection directly into the MongoDB collections. Ensure keys heavily align to Schema standards.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Target Collection</label>
              <select 
                value={bulkImportForm.modelName} 
                onChange={e => setBulkImportForm({ ...bulkImportForm, modelName: e.target.value })} 
                style={inputStyle}
              >
                <option value="User">User (Students/Teachers)</option>
                <option value="Attendance">Attendance</option>
                <option value="Timetable">Timetable</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Raw JSON Array Input</label>
              <textarea
                value={bulkImportForm.rawJson}
                onChange={e => setBulkImportForm({ ...bulkImportForm, rawJson: e.target.value })}
                placeholder={'[\n  { "name": "Test Student", "email": "test@school.edu", "password": "pass", "role": "student" }\n]'}
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
