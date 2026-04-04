import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import MarksTable, { SUBJECTS } from '../../components/academics/MarksTable';
import ReportCard from '../../components/academics/ReportCard';
import { generateReportPDF } from '../../components/academics/PDFGenerator';

/* ── Dummy Students ── */
const INITIAL_STUDENTS = [
  { id: 1, name: 'Aarav Sharma',    marks: ['', '', ''], total: 0, average: 0 },
  { id: 2, name: 'Priya Patel',     marks: ['', '', ''], total: 0, average: 0 },
  { id: 3, name: 'Rohan Gupta',     marks: ['', '', ''], total: 0, average: 0 },
  { id: 4, name: 'Ananya Singh',    marks: ['', '', ''], total: 0, average: 0 },
  { id: 5, name: 'Vikram Reddy',    marks: ['', '', ''], total: 0, average: 0 },
  { id: 6, name: 'Sneha Joshi',     marks: ['', '', ''], total: 0, average: 0 },
  { id: 7, name: 'Arjun Mehta',     marks: ['', '', ''], total: 0, average: 0 },
  { id: 8, name: 'Kavya Nair',      marks: ['', '', ''], total: 0, average: 0 },
  { id: 9, name: 'Rahul Desai',     marks: ['', '', ''], total: 0, average: 0 },
  { id: 10, name: 'Ishita Kapoor',  marks: ['', '', ''], total: 0, average: 0 },
];

/* Pre-filled demo data */
const DEMO_STUDENTS = [
  { id: 1, name: 'Aarav Sharma',    marks: [92, 88, 95], total: 275, average: 91.67 },
  { id: 2, name: 'Priya Patel',     marks: [78, 85, 72], total: 235, average: 78.33 },
  { id: 3, name: 'Rohan Gupta',     marks: [65, 58, 70], total: 193, average: 64.33 },
  { id: 4, name: 'Ananya Singh',    marks: [95, 92, 98], total: 285, average: 95.00 },
  { id: 5, name: 'Vikram Reddy',    marks: [45, 52, 38], total: 135, average: 45.00 },
  { id: 6, name: 'Sneha Joshi',     marks: [82, 76, 88], total: 246, average: 82.00 },
  { id: 7, name: 'Arjun Mehta',     marks: [71, 68, 75], total: 214, average: 71.33 },
  { id: 8, name: 'Kavya Nair',      marks: [88, 94, 91], total: 273, average: 91.00 },
  { id: 9, name: 'Rahul Desai',     marks: [55, 48, 62], total: 165, average: 55.00 },
  { id: 10, name: 'Ishita Kapoor',  marks: [90, 87, 93], total: 270, average: 90.00 },
];

const tabs = [
  { key: 'marks-entry', label: 'Marks Entry', icon: '✏️' },
  { key: 'report-cards', label: 'Report Cards', icon: '📋' },
];

import useLocalStorage from '../../hooks/useLocalStorage';

export default function AcademicDashboard() {
  const { user } = useAuth();
  const { success, info } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marks-entry');
  const [students, setStudents] = useLocalStorage('edubase_students_marks', INITIAL_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'marks-management' || hash === 'marks-entry') setActiveTab('marks-entry');
    else if (hash === 'report-cards') setActiveTab('report-cards');
  }, [location.hash]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`#${tab}`, { replace: true });
  };

  const handleSave = () => {
    const incomplete = students.filter(s => s.marks.some(m => m === ''));
    if (incomplete.length === students.length) {
      info('Please enter marks for at least one student before saving.');
      return;
    }
    setSaved(true);
    success('Marks saved successfully!');
  };

  const handleGenerateReport = () => {
    const completed = students.filter(s => s.marks.every(m => m !== ''));
    if (completed.length === 0) {
      info('Please enter marks for all subjects of at least one student to generate reports.');
      return;
    }
    setActiveTab('report-cards');
    navigate('#report-cards', { replace: true });
    success(`Report generated successfully! ${completed.length} student report cards are ready.`);
  };

  const handleDownloadPDF = (student) => {
    setPreviewStudent(student);
    setShowPreview(true);
  };

  const handleConfirmDownload = () => {
    if (previewStudent) {
      generateReportPDF(previewStudent);
      success(`Report card for ${previewStudent.name} downloaded successfully!`);
    }
    setShowPreview(false);
    setPreviewStudent(null);
  };

  const handleLoadDemo = () => {
    setStudents(DEMO_STUDENTS.map(s => ({ ...s })));
    success('Demo data loaded! All student marks have been pre-filled.');
  };

  const handleReset = () => {
    setStudents(INITIAL_STUDENTS.map(s => ({ ...s, marks: ['', '', ''] })));
    setSelectedStudent(null);
    setSaved(false);
    info('All marks have been cleared.');
  };

  /* ── Styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };

  return (
    <div style={{ position: 'relative' }}>
      {/* ═══ PAGE HEADER ═══ */}
      <div style={{
        ...sectionStyle,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
        borderLeft: '4px solid var(--primary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '16px',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700,
            marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Marks Management
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Enter student marks, generate report cards, and download PDF reports
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={handleLoadDemo} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-md)',
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)',
            color: '#06b6d4', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.12)'; }}
          >
            Load Demo Data
          </button>
          <button onClick={handleReset} style={{
            padding: '8px 18px', borderRadius: 'var(--radius-md)',
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'var(--bg-card)', padding: '5px', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
      }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
            flex: 1, padding: '12px 20px', borderRadius: 'var(--radius-md)',
            background: activeTab === tab.key ? 'linear-gradient(135deg, var(--primary), var(--violet))' : 'transparent',
            border: 'none',
            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.3s var(--spring)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ CONTENT ═══ */}
      {activeTab === 'marks-entry' && (
        <MarksTable
          students={students}
          setStudents={setStudents}
          onSave={handleSave}
          onGenerateReport={handleGenerateReport}
        />
      )}

      {activeTab === 'report-cards' && (
        <ReportCard
          students={students}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          onDownloadPDF={handleDownloadPDF}
        />
      )}

      {/* ═══ PDF PREVIEW MODAL ═══ */}
      {showPreview && previewStudent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.2s ease',
        }} onClick={() => setShowPreview(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '90%', maxWidth: '480px',
            background: 'var(--bg-deep)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            animation: 'fadeInScale 0.3s var(--spring)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                Download Report Card
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Generate a professional PDF report card for <strong style={{ color: 'var(--text-primary)' }}>{previewStudent.name}</strong>
              </p>
            </div>

            {/* Preview info */}
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)', border: '1px solid var(--border-default)',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {SUBJECTS.map((sub, i) => (
                  <div key={sub} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{sub}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{previewStudent.marks[i]}</span>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', paddingTop: '8px', borderTop: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>Total: {previewStudent.total}/{SUBJECTS.length * 100}</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Average: {previewStudent.average.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPreview(false)} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleConfirmDownload} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary), var(--violet))',
                border: 'none', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all 0.3s var(--spring)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
