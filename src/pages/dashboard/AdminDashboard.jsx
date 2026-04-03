import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import marks, { getAverageMarks, getClassAverage } from '../../data/marks';
import { getAttendanceRate } from '../../data/attendance';
import aiInsights from '../../data/aiInsights';
import StatCard from '../../components/ui/StatCard';
import AIInsightBox from '../../components/ui/AIInsightBox';
import GradientButton from '../../components/ui/GradientButton';
import Modal from '../../components/ui/Modal';
import AttendanceChart from '../../components/charts/AttendanceChart';
import { useNotification } from '../../context/NotificationContext';
import useAI from '../../hooks/useAI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [announcement, setAnnouncement] = useState({ title: '', content: '', target: 'all' });
  
  // New features
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', class: '', rollNo: '', email: '', phone: '' });
  const csvInputRef = React.useRef(null);
  const [selectedInsight, setSelectedInsight] = useState(null);

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        return info('Please upload a valid .csv file');
      }
      info('Parsing CSV file...');
      setTimeout(() => success(`Successfully imported students from ${file.name}!`), 1500);
    }
  };

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const API_URL = isLocal ? 'http://localhost:5000/api' : '/api';

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.rollNo) return info('Please fill required fields');
    try {
      // Get the local storage token to authorize admin requests
      const stored = localStorage.getItem('eduflow_user');
      const token = stored ? JSON.parse(stored).token : null;
      
      await axios.post(`${API_URL}/students`, newStudent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      success(`Successfully added ${newStudent.name} to the database!`);
      setAddStudentModal(false);
      setNewStudent({ name: '', class: '', rollNo: '', email: '', phone: '' });
    } catch (err) {
      info(err.response?.data?.message || 'Failed to add student to database');
    }
  };

  const handleSeed = async () => {
    try {
      await axios.post(`${API_URL}/auth/seed`);
      success('Database seeded successfully! Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      info('Seed failed: ' + (err.response?.data?.message || err.message));
    }
  };
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: 'Mid-Term Exam Schedule Released', content: 'Mid-term exams will be held from March 20-28.', target: 'all', date: '2026-03-10', reads: 42 },
    { id: 2, title: 'Staff Meeting — Friday 4 PM', content: 'All teachers are requested to attend the monthly staff meeting.', target: 'teachers', date: '2026-03-12', reads: 5 },
  ]);
  const { success, info } = useNotification();
  const { generateResponse } = useAI();



  const getRiskBadge = (studentId) => {
    const avg = getAverageMarks(studentId);
    const att = getAttendanceRate(studentId);
    if (avg < 40 || att < 60) return { label: '🔴 Critical', color: '#f43f5e' };
    if (avg < 55 || att < 75) return { label: '🟠 At Risk', color: '#f59e0b' };
    if (avg < 70 || att < 85) return { label: '🟡 Watch', color: '#eab308' };
    return { label: '🟢 Safe', color: '#10b981' };
  };

  const addAnnouncement = () => {
    if (!announcement.title) return;
    setAnnouncements(prev => [
      { ...announcement, id: Date.now(), date: new Date().toISOString().slice(0, 10), reads: 0 },
      ...prev
    ]);
    setAnnouncement({ title: '', content: '', target: 'all' });
    setAnnouncementModal(false);
    success('Announcement published successfully!');
  };

  const sectionStyle = {
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: '24px',
  };

  const [dbStudents, setDbStudents] = useState([]);
  const [dbTeachers, setDbTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('eduflow_user');
        const token = stored ? JSON.parse(stored).token : null;
        if (!token) return;

        const [sRes, tRes] = await Promise.all([
          axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${token}` } }),
          // We don't have a teachers route yet, so we'll use a mocked success for now or keep old
          Promise.resolve({ data: [] }) 
        ]);
        
        setDbStudents(sRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudents = dbStudents.length > 0 ? dbStudents : [];
  const totalStudentsCount = currentStudents.length;
  const totalTeachersCount = 12; // Static for now until teacher routes are added
  const totalClassesCount = [...new Set(currentStudents.map(s => s.class))].length || 0;
  const schoolAttendanceRate = 92;

  // New logic for charts
  const attendanceTrend = Array.from({ length: 30 }, (_, i) => ({
    name: `Day ${i + 1}`,
    rate: Math.round(75 + Math.random() * 20),
  }));

  const classPerformance = ['10A', '10B'].map(cls => ({
    name: cls,
    avg: Math.round(65 + Math.random() * 25)
  }));

  const subjectDifficulty = marks.subjects.map(s => ({
    name: s.length > 8 ? s.slice(0, 8) + '.' : s,
    avg: getClassAverage(s),
  })).sort((a, b) => a.avg - b.avg);

  // Filter logic using db data
  const filteredStudents = currentStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.class && s.class.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && dbStudents.length === 0) {
    return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading live data...
        </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon="👥" value={totalStudentsCount} label="Total Students" color="var(--primary)" delay={0} />
        <StatCard icon="👨‍🏫" value={totalTeachersCount} label="Teachers" color="var(--violet)" delay={1} />
        <StatCard icon="🏫" value={totalClassesCount} label="Class Rooms" color="var(--cyan)" delay={2} />
        <StatCard icon="✅" value={schoolAttendanceRate} suffix="%" label="School Attendance" color="var(--emerald)" delay={3} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['overview', 'students', 'teachers', 'ai-analytics', 'announcements'].map(tab => (
          <button key={tab} onClick={() => handleTabChange(tab)} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-full)',
            background: activeSection === tab ? 'linear-gradient(135deg, var(--violet), var(--primary))' : 'var(--bg-card)',
            border: activeSection === tab ? 'none' : '1px solid var(--border-default)',
            color: activeSection === tab ? 'white' : 'var(--text-secondary)',
            fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize',
            transition: 'all 0.3s var(--spring)',
          }}>{tab.replace('-', ' ')}</button>
        ))}
      </div>

      {/* ═══ OVERVIEW ═══ */}
      {activeSection === 'overview' && (
        <>
          {totalStudentsCount === 0 && (
            <div style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px', textAlign: 'center' }}>
               <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Welcome to your Live EduFlow AI Instance! 🚀</h3>
               <p style={{ color: 'var(--text-secondary)', maxWidth: '500px' }}>Your production database is currently empty. Would you like to seed it with sample students and records to see the dashboard in action?</p>
               <div style={{ width: '240px' }}>
                <GradientButton onClick={handleSeed}>Seed Sample Data</GradientButton>
               </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <AttendanceChart data={attendanceTrend} title="📋 School Attendance — Last 30 Days" />

            <div style={sectionStyle}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
                🏫 Class-wise Performance
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(2,8,23,0.95)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                  <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                    {classPerformance.map((_, i) => (
                      <Bar key={i} dataKey="avg" fill={i === 0 ? '#6366f1' : '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Difficulty */}
          <div style={sectionStyle}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>
              📊 Subject Difficulty Ranking
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subjectDifficulty.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ width: '120px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.name}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-deep)' }}>
                    <div style={{
                      height: '100%', borderRadius: 4,
                      background: s.avg >= 70 ? 'var(--emerald)' : s.avg >= 50 ? 'var(--warning)' : 'var(--danger)',
                      width: `${s.avg}%`, transition: 'width 1s',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, width: '40px', textAlign: 'right', fontSize: '0.9rem' }}>{s.avg}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top/Bottom Classes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{
              padding: '20px', borderRadius: 'var(--radius-lg)',
              background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>Top Performing</span>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                Class {classPerformance.sort((a, b) => b.avg - a.avg)[0]?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Avg: {classPerformance.sort((a, b) => b.avg - a.avg)[0]?.avg}%
              </div>
            </div>
            <div style={{
              padding: '20px', borderRadius: 'var(--radius-lg)',
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span style={{ fontWeight: 600, color: 'var(--danger)' }}>Needs Attention</span>
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700 }}>
                Class {classPerformance.sort((a, b) => a.avg - b.avg)[0]?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Avg: {classPerformance.sort((a, b) => a.avg - b.avg)[0]?.avg}%
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ STUDENTS ═══ */}
      {activeSection === 'students' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>
              👥 Student Management
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text" placeholder="Search students..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-deep)', border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)', fontSize: '0.85rem', width: '220px',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
              />
              <input type="file" accept=".csv" ref={csvInputRef} style={{ display: 'none' }} onChange={handleCSVUpload} />
              <GradientButton size="sm" onClick={() => csvInputRef.current?.click()}>📤 Import CSV</GradientButton>
              <GradientButton size="sm" variant="cyan" onClick={() => setAddStudentModal(true)}>+ Add Student</GradientButton>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['ID', 'Name', 'Class', 'Attendance', 'Avg Marks', 'Risk Level', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const avg = getAverageMarks(student.id);
                  const att = getAttendanceRate(student.id);
                  const risk = getRiskBadge(student.id);
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.rollNo}</td>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.65rem', fontWeight: 700,
                        }}>{student.avatar}</div>
                        <span style={{ fontWeight: 500 }}>{student.name}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '0.85rem' }}>{student.class}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: att >= 75 ? 'var(--emerald)' : 'var(--danger)', fontWeight: 600 }}>{att}%</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: avg >= 60 ? 'var(--primary)' : 'var(--danger)' }}>{avg}%</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 'var(--radius-full)',
                          background: `${risk.color}15`, color: risk.color,
                          fontSize: '0.75rem', fontWeight: 600,
                        }}>{risk.label}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => setSelectedStudent(student)} style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                            background: 'var(--bg-deep)', border: '1px solid var(--border-default)',
                            color: 'var(--text-secondary)', fontSize: '0.75rem',
                          }}>👁 View</button>
                          <button style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
                            color: 'var(--ai-glow)', fontSize: '0.75rem',
                          }} onClick={() => info('AI report generating...')}>🤖 Report</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={`Student: ${selectedStudent?.name}`}>
        {selectedStudent && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Roll No</span><div style={{ fontWeight: 600 }}>{selectedStudent.rollNo}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Class</span><div style={{ fontWeight: 600 }}>{selectedStudent.class}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Email</span><div style={{ fontWeight: 600 }}>{selectedStudent.email}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Phone</span><div style={{ fontWeight: 600 }}>{selectedStudent.phone}</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Attendance</span><div style={{ fontWeight: 600 }}>{getAttendanceRate(selectedStudent.id)}%</div></div>
              <div><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Avg Marks</span><div style={{ fontWeight: 600 }}>{getAverageMarks(selectedStudent.id)}%</div></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal isOpen={addStudentModal} onClose={() => setAddStudentModal(false)} title="Register New Student" maxWidth="500px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Full Name *</label>
            <input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="John Doe"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Roll No *</label>
              <input value={newStudent.rollNo} onChange={e => setNewStudent({ ...newStudent, rollNo: e.target.value })} placeholder="STU001"
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Class / Section</label>
              <input value={newStudent.class} onChange={e => setNewStudent({ ...newStudent, class: e.target.value })} placeholder="10A"
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} placeholder="student@school.edu" type="email"
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />
          </div>
          <GradientButton onClick={handleAddStudent} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            💾 Save Student Record
          </GradientButton>
        </div>
      </Modal>

      {/* ═══ TEACHERS ═══ */}
      {activeSection === 'teachers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {teachers.map((teacher, i) => (
            <div key={teacher.id} style={{
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              animation: `float 3s ease-in-out infinite ${i * 0.3}s`,
              transition: 'all 0.4s var(--spring)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = '';
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--violet), var(--primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem',
                }}>{teacher.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{teacher.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{teacher.subject}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating</div>
                  <div style={{ fontWeight: 700, color: 'var(--warning)' }}>⭐ {teacher.rating}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-deep)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Students</div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{teacher.studentsCount}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Classes: {teacher.classes.join(', ')} · {teacher.experience}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ AI ANALYTICS ═══ */}
      {activeSection === 'ai-analytics' && (
        <>
          <div style={sectionStyle}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏫 School-Wide AI Analysis
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {aiInsights.schoolInsights.map((insight, i) => {
                const typeColors = { danger: '#f43f5e', warning: '#f59e0b', info: '#06b6d4', success: '#10b981' };
                const color = typeColors[insight.type] || '#6366f1';
                return (
                  <div key={i} style={{
                    padding: '14px 18px', borderRadius: 'var(--radius-md)',
                    background: `${color}08`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    animation: `floatSubtle 4s ease-in-out infinite ${i * 0.3}s`,
                  }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{insight.text}</span>
                    <button style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      background: `${color}15`, border: `1px solid ${color}30`,
                      color, fontSize: '0.75rem', fontWeight: 600,
                    }} onClick={() => setSelectedInsight(insight)}>View →</button>
                  </div>
                );
              })}
            </div>
          </div>

          <AIInsightBox
            title="Deep School Analytics"
            prompt="Analyze school-wide performance data across all classes and subjects. Identify trends, risks, and actionable recommendations for the administration."
            onGenerate={(prompt, onStream) => generateResponse(prompt, onStream)}
          />
        </>
      )}

      {/* ═══ ANNOUNCEMENTS ═══ */}
      {activeSection === 'announcements' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600 }}>📢 Announcements</h4>
            <GradientButton onClick={() => setAnnouncementModal(true)}>+ New Announcement</GradientButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map(ann => (
              <div key={ann.id} style={{
                ...sectionStyle,
                marginBottom: 0,
                transition: 'all 0.3s var(--spring)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h5 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{ann.title}</h5>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 'var(--radius-full)',
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                      fontSize: '0.7rem', color: 'var(--primary-light)', textTransform: 'capitalize',
                    }}>{ann.target}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ann.date}</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{ann.content}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👁 {ann.reads} reads</span>
              </div>
            ))}
          </div>

          {/* Announcement Modal */}
          <Modal isOpen={announcementModal} onClose={() => setAnnouncementModal(false)} title="New Announcement" maxWidth="550px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Title</label>
                <input value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} placeholder="Announcement title"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Content</label>
                <textarea value={announcement.content} onChange={e => setAnnouncement({ ...announcement, content: e.target.value })} placeholder="Write announcement content..."
                  rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-deep)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Target Audience</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['all', 'teachers', 'students'].map(t => (
                    <button key={t} onClick={() => setAnnouncement({ ...announcement, target: t })} style={{
                      flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                      background: announcement.target === t ? 'var(--primary)' : 'var(--bg-deep)',
                      border: announcement.target === t ? 'none' : '1px solid var(--border-default)',
                      color: announcement.target === t ? 'white' : 'var(--text-muted)',
                      fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize',
                    }}>{t}</button>
                  ))}
                </div>
              </div>
              <GradientButton onClick={addAnnouncement} style={{ width: '100%', justifyContent: 'center' }}>
                📢 Publish Announcement
              </GradientButton>
            </div>
          </Modal>
        </>
      )}

      {/* AI Insight Modal */}
      <Modal isOpen={!!selectedInsight} onClose={() => setSelectedInsight(null)} title="AI Insight Details" maxWidth="500px">
        {selectedInsight && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-deep)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{selectedInsight.text}</p>
            </div>
            <div style={{ padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 600, color: 'var(--ai-glow)' }}>
                <span>🧠</span> Recommended Action
              </div>
              <p style={{ fontSize: '0.85rem' }}>{selectedInsight.action || 'Discuss with relevant department heads to implement systematic changes based on this analysis.'}</p>
            </div>
            <GradientButton onClick={() => { setSelectedInsight(null); success('Action plan initiated!'); }} style={{ width: '100%', justifyContent: 'center' }}>
              Initiate Action Plan
            </GradientButton>
          </div>
        )}
      </Modal>

    </div>
  );
}
