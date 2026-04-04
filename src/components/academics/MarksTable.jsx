import { useState, useMemo } from 'react';

const GRADING_RULES = [
  { min: 85, grade: 'A', color: '#10b981', label: 'Excellent' },
  { min: 70, grade: 'B', color: '#06b6d4', label: 'Good' },
  { min: 50, grade: 'C', color: '#f59e0b', label: 'Average' },
  { min: 0,  grade: 'Fail', color: '#f43f5e', label: 'Needs Improvement' },
];

function getGrade(average) {
  for (const rule of GRADING_RULES) {
    if (average >= rule.min) return rule;
  }
  return GRADING_RULES[GRADING_RULES.length - 1];
}

const SUBJECTS = ['Mathematics', 'Science', 'English'];

export default function MarksTable({ students, setStudents, onSave, onGenerateReport }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { studentIdx, subjectIdx }

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  const handleMarkChange = (studentId, subjectIndex, value) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(100, parseInt(value) || 0));
    setStudents(prev =>
      prev.map(s => {
        if (s.id !== studentId) return s;
        const newMarks = [...s.marks];
        newMarks[subjectIndex] = numValue;
        const validMarks = newMarks.filter(m => m !== '');
        const total = validMarks.reduce((a, b) => a + b, 0);
        const average = validMarks.length > 0 ? total / validMarks.length : 0;
        return { ...s, marks: newMarks, total, average };
      })
    );
  };

  const handleMarkAll = (value) => {
    setStudents(prev =>
      prev.map(s => {
        const newMarks = s.marks.map(() => value);
        const total = value * SUBJECTS.length;
        const average = value;
        return { ...s, marks: newMarks, total, average };
      })
    );
  };

  const handleClearAll = () => {
    setStudents(prev =>
      prev.map(s => ({
        ...s,
        marks: s.marks.map(() => ''),
        total: 0,
        average: 0,
      }))
    );
  };

  /* ── Stat summary ── */
  const stats = useMemo(() => {
    const completed = students.filter(s => s.marks.every(m => m !== ''));
    const classAvg = completed.length > 0
      ? (completed.reduce((a, s) => a + s.average, 0) / completed.length).toFixed(1)
      : '—';
    const topStudent = completed.length > 0
      ? completed.reduce((best, s) => s.average > best.average ? s : best, completed[0])
      : null;
    const gradeDistribution = {};
    completed.forEach(s => {
      const g = getGrade(s.average).grade;
      gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
    });
    return { total: students.length, completed: completed.length, classAvg, topStudent, gradeDistribution };
  }, [students]);

  /* ── Styles ── */
  const sectionStyle = { padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' };
  const thStyle = { padding: '14px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-default)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' };
  const tdStyle = { padding: '12px', fontSize: '0.85rem', borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' };
  const inputStyle = {
    width: '72px', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-deep)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'center',
    transition: 'all 0.2s var(--smooth)', fontFamily: 'var(--font-mono)',
  };
  const btnPrimary = { padding: '10px 22px', borderRadius: 'var(--radius-md)', background: 'linear-gradient(135deg, var(--primary), var(--violet))', color: 'white', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer', transition: 'all 0.3s var(--spring)' };
  const btnOutline = { padding: '10px 22px', borderRadius: 'var(--radius-md)', background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s var(--spring)' };

  return (
    <div>
      {/* ── Stats Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Students', value: stats.total, color: 'var(--primary)', icon: '👥' },
          { label: 'Marks Entered', value: `${stats.completed}/${stats.total}`, color: 'var(--cyan)', icon: '✏️' },
          { label: 'Class Average', value: stats.classAvg, color: 'var(--emerald)', icon: '📊' },
          { label: 'Top Scorer', value: stats.topStudent?.name?.split(' ')[0] || '—', color: 'var(--violet)', icon: '🏆' },
        ].map((card, i) => (
          <div key={i} style={{
            ...sectionStyle, marginBottom: 0, textAlign: 'center',
            borderLeft: `3px solid ${card.color}`,
            background: `linear-gradient(135deg, var(--bg-card), ${card.color}08)`,
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{card.icon}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>{card.label}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ── Grade Distribution ── */}
      {Object.keys(stats.gradeDistribution).length > 0 && (
        <div style={{ ...sectionStyle, marginBottom: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-secondary)' }}>
            Grade Distribution
          </h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {GRADING_RULES.map(rule => {
              const count = stats.gradeDistribution[rule.grade] || 0;
              return (
                <div key={rule.grade} style={{
                  padding: '10px 20px', borderRadius: 'var(--radius-md)',
                  background: `${rule.color}12`, border: `1px solid ${rule.color}30`,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  minWidth: '120px',
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: rule.color, fontFamily: 'var(--font-heading)' }}>{rule.grade}</span>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rule.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                ...inputStyle, width: '240px', textAlign: 'left', paddingLeft: '36px',
                borderRadius: 'var(--radius-md)',
              }}
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <button onClick={handleClearAll} style={btnOutline}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Clear All
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} style={btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Save Marks
            </span>
          </button>
          <button onClick={onGenerateReport} style={{ ...btnPrimary, background: 'linear-gradient(135deg, var(--emerald), var(--cyan))' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Generate Report
            </span>
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ ...sectionStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-deep)' }}>
                <th style={{ ...thStyle, width: '50px', textAlign: 'center' }}>#</th>
                <th style={{ ...thStyle, minWidth: '180px' }}>Student Name</th>
                {SUBJECTS.map(sub => (
                  <th key={sub} style={{ ...thStyle, textAlign: 'center', minWidth: '120px' }}>{sub}</th>
                ))}
                <th style={{ ...thStyle, textAlign: 'center', minWidth: '80px' }}>Total</th>
                <th style={{ ...thStyle, textAlign: 'center', minWidth: '80px' }}>Average</th>
                <th style={{ ...thStyle, textAlign: 'center', minWidth: '90px' }}>Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, sIdx) => {
                const gradeInfo = getGrade(student.average);
                const isComplete = student.marks.every(m => m !== '');
                return (
                  <tr key={student.id} style={{
                    background: sIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = sIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{sIdx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${gradeInfo.color}40, ${gradeInfo.color}20)`,
                          border: `2px solid ${gradeInfo.color}50`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: gradeInfo.color, fontSize: '0.65rem', fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{student.name}</span>
                      </div>
                    </td>
                    {student.marks.map((mark, mIdx) => (
                      <td key={mIdx} style={{ ...tdStyle, textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={mark}
                          placeholder="—"
                          onChange={e => handleMarkChange(student.id, mIdx, e.target.value)}
                          onFocus={e => {
                            setEditingCell({ studentIdx: sIdx, subjectIdx: mIdx });
                            e.target.style.borderColor = 'var(--primary)';
                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                          }}
                          onBlur={e => {
                            setEditingCell(null);
                            e.target.style.borderColor = 'var(--border-default)';
                            e.target.style.boxShadow = 'none';
                          }}
                          style={{
                            ...inputStyle,
                            color: mark === '' ? 'var(--text-muted)' : mark >= 85 ? '#10b981' : mark >= 70 ? '#06b6d4' : mark >= 50 ? '#f59e0b' : '#f43f5e',
                            fontWeight: mark !== '' ? 600 : 400,
                          }}
                        />
                      </td>
                    ))}
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem',
                        color: isComplete ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}>
                        {isComplete ? student.total : '—'}
                      </span>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/ {SUBJECTS.length * 100}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.85rem',
                        color: isComplete ? gradeInfo.color : 'var(--text-muted)',
                      }}>
                        {isComplete ? student.average.toFixed(1) + '%' : '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {isComplete ? (
                        <span style={{
                          display: 'inline-block', padding: '5px 14px',
                          borderRadius: 'var(--radius-full)',
                          background: `${gradeInfo.color}15`,
                          border: `1px solid ${gradeInfo.color}35`,
                          color: gradeInfo.color,
                          fontSize: '0.8rem', fontWeight: 700,
                          letterSpacing: '0.5px',
                        }}>
                          {gradeInfo.grade}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '12px 0', flexWrap: 'wrap' }}>
        {GRADING_RULES.map(rule => (
          <div key={rule.grade} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: rule.color }} />
            <span><strong style={{ color: rule.color }}>{rule.grade}</strong> ({rule.min}+)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SUBJECTS, getGrade, GRADING_RULES };
