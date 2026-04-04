import { useState } from 'react';
import { SUBJECTS, getGrade, GRADING_RULES } from './MarksTable';

const AI_REMARKS = {
  A: [
    'Outstanding academic performance! Continue this excellent work.',
    'Exceptional dedication and mastery across all subjects.',
    'A stellar student who consistently demonstrates deep understanding.',
  ],
  B: [
    'Good performance with room for improvement in some areas.',
    'Solid understanding of concepts. Aim higher next semester!',
    'Commendable effort. Focus on weak areas to reach the top.',
  ],
  C: [
    'Average performance. Regular practice and study sessions recommended.',
    'Shows potential but needs to invest more effort consistently.',
    'Capable student who needs to focus more on fundamentals.',
  ],
  Fail: [
    'Needs immediate attention and additional support to improve.',
    'Struggling with core concepts. Recommend extra tutoring sessions.',
    'Must dedicate more time to studies. Parent-teacher meeting advised.',
  ],
};

function getAIRemark(grade) {
  const remarks = AI_REMARKS[grade] || AI_REMARKS.Fail;
  return remarks[Math.floor(Math.random() * remarks.length)];
}

export default function ReportCard({ students, selectedStudent, onSelectStudent, onDownloadPDF }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'detail'

  const completedStudents = students.filter(s => s.marks.every(m => m !== ''));

  /* ── Styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };

  if (completedStudents.length === 0) {
    return (
      <div style={{ ...sectionStyle, textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }}>📋</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
          No Report Cards Available
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
          Enter marks for all subjects in the Marks Table to generate report cards for students.
        </p>
      </div>
    );
  }

  /* ── Detail View ── */
  if (selectedStudent) {
    const student = selectedStudent;
    const gradeInfo = getGrade(student.average);
    const remark = getAIRemark(gradeInfo.grade);
    const maxMark = Math.max(...student.marks);
    const minMark = Math.min(...student.marks);
    const bestSubject = SUBJECTS[student.marks.indexOf(maxMark)];
    const weakestSubject = SUBJECTS[student.marks.indexOf(minMark)];

    return (
      <div>
        {/* Back button */}
        <button onClick={() => onSelectStudent(null)} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
          marginBottom: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to All Students
        </button>

        {/* Report Card */}
        <div id="report-card-content" style={{
          ...sectionStyle,
          background: 'linear-gradient(135deg, var(--bg-card), var(--bg-deep))',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Decorative top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: `linear-gradient(90deg, ${gradeInfo.color}, var(--primary), var(--violet))`,
          }} />

          {/* Header */}
          <div style={{ textAlign: 'center', paddingTop: '20px', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '8px 24px', borderRadius: 'var(--radius-full)',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              marginBottom: '16px',
            }}>
              <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 15 L20 75 L38 75 L50 48 L62 75 L80 75 Z" fill="#6366f1" />
                <polygon points="50,60 42,75 58,75" fill="#6366f1" />
              </svg>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                EDUBASE ACADEMY
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800,
              background: 'linear-gradient(135deg, var(--text-primary), var(--primary))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: '4px',
            }}>
              Academic Report Card
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Academic Year 2025-26 | Semester II
            </p>
          </div>

          {/* Student Info */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto',
            gap: '24px', marginBottom: '32px', alignItems: 'center',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Student Name', value: student.name },
                { label: 'Roll Number', value: `EDU-${String(student.id).padStart(4, '0')}` },
                { label: 'Class', value: '10th Standard' },
                { label: 'Division', value: 'A' },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `linear-gradient(135deg, ${gradeInfo.color}40, ${gradeInfo.color}15)`,
              border: `3px solid ${gradeInfo.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: gradeInfo.color }}>{gradeInfo.grade}</span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>GRADE</span>
            </div>
          </div>

          {/* Marks Table */}
          <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-deep)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Marks</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Out Of</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Grade</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Performance</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map((sub, i) => {
                  const mark = student.marks[i];
                  const subGrade = getGrade(mark);
                  return (
                    <tr key={sub} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', fontWeight: 500 }}>{sub}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: subGrade.color }}>{mark}</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', textAlign: 'center', color: 'var(--text-muted)' }}>100</td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)', textAlign: 'center' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', background: `${subGrade.color}15`, color: subGrade.color, fontSize: '0.75rem', fontWeight: 700 }}>
                          {subGrade.grade}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-default)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-deep)', maxWidth: '120px' }}>
                            <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${subGrade.color}, ${subGrade.color}80)`, width: `${mark}%`, transition: 'width 0.5s' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: subGrade.color }}>{mark}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--bg-deep)' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '0.85rem' }}>Total</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: gradeInfo.color }}>{student.total}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>{SUBJECTS.length * 100}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', background: `${gradeInfo.color}20`, border: `1px solid ${gradeInfo.color}40`, color: gradeInfo.color, fontSize: '0.85rem', fontWeight: 800 }}>
                      {gradeInfo.grade}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: gradeInfo.color }}>{student.average.toFixed(1)}% Average</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Best Subject</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>{bestSubject}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{maxMark}/100 marks</div>
            </div>
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Needs Improvement</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f43f5e' }}>{weakestSubject}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{minMark}/100 marks</div>
            </div>
          </div>

          {/* AI Remark */}
          <div style={{
            padding: '20px', borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))',
            border: '1px solid rgba(99,102,241,0.15)',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Teacher's Remarks (AI-Generated)</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
              "{remark}"
            </p>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: '20px', borderTop: '1px solid var(--border-default)',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <button onClick={() => onDownloadPDF(student)} style={{
              padding: '10px 24px', borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--violet))',
              color: 'white', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.3s var(--spring)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Report as PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Grid View (All Students) ── */
  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Student Report Cards
          <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '8px' }}>
            ({completedStudents.length} available)
          </span>
        </h3>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-deep)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          {['grid', 'list'].map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-sm)',
              background: viewMode === mode ? 'var(--primary)' : 'transparent',
              color: viewMode === mode ? 'white' : 'var(--text-muted)',
              border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 0.2s',
            }}>{mode}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
        gap: '16px',
      }}>
        {completedStudents.map(student => {
          const gradeInfo = getGrade(student.average);
          return (
            <div key={student.id} onClick={() => onSelectStudent(student)} style={{
              ...sectionStyle, marginBottom: 0, cursor: 'pointer',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s var(--spring)',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 32px ${gradeInfo.color}20`;
                e.currentTarget.style.borderColor = `${gradeInfo.color}40`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-default)';
              }}
            >
              {/* Top color bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: gradeInfo.color }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${gradeInfo.color}30, ${gradeInfo.color}10)`,
                    border: `2px solid ${gradeInfo.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: gradeInfo.color, fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{student.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Roll #EDU-{String(student.id).padStart(4, '0')}</div>
                  </div>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `${gradeInfo.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 800, color: gradeInfo.color,
                  fontFamily: 'var(--font-heading)',
                }}>
                  {gradeInfo.grade}
                </div>
              </div>

              {/* Subject marks mini-bars */}
              <div style={{ marginBottom: '16px' }}>
                {SUBJECTS.map((sub, i) => {
                  const mark = student.marks[i];
                  const subGrade = getGrade(mark);
                  return (
                    <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: '80px', flexShrink: 0 }}>{sub}</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg-deep)' }}>
                        <div style={{ height: '100%', borderRadius: 3, background: subGrade.color, width: `${mark}%`, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: subGrade.color, width: '30px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{mark}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '12px', borderTop: '1px solid var(--border-default)',
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Total: <strong style={{ color: 'var(--text-primary)' }}>{student.total}/{SUBJECTS.length * 100}</strong>
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Report
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
