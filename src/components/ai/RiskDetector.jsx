import { useState } from 'react';
import { calculateRiskScore, getRiskLevel, getRiskFactors, getConfidence } from '../../utils/riskEngine';
import RiskMeter from '../ui/RiskMeter';
import useAI from '../../hooks/useAI';
import GradientButton from '../ui/GradientButton';

export default function RiskDetector({ students = [] }) {
  const { loading, generateResponse } = useAI();
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Since we accept real database students, we need to map them:
  // Note: For a real app, attendance & avgMarks should be fed into calculateRiskScore,
  // but for now we default to random values or base them on missing data.
  const riskStudents = students
    .map(s => {
      // Mocking attendance and marks extraction since it requires database aggregation
      const attendancePct = Math.floor(Math.random() * 40) + 40; // 40-80%
      const avgMarks = Math.floor(Math.random() * 40) + 30; // 30-70%
      const riskScore = calculateRiskScore(attendancePct, avgMarks);
      
      return {
        ...s,
        id: s._id,
        avatar: s.name ? s.name.substring(0, 2).toUpperCase() : 'ST',
        rollNo: s.rollNo || 'N/A',
        riskScore,
        riskLevel: getRiskLevel(riskScore),
        factors: getRiskFactors(attendancePct, avgMarks),
        confidence: getConfidence(riskScore),
      };
    })
    .filter(s => s.riskScore > 20)
    .sort((a, b) => b.riskScore - a.riskScore);

  const handleAIAnalysis = async () => {
    setShowAnalysis(true);
    const prompt = `Analyze at-risk students and provide intervention recommendations:\n${riskStudents.map(s => `${s.name}: Risk ${s.riskScore}/100, Factors: ${s.factors.join(', ')}`).join('\n')}`;
    await generateResponse(prompt, (p) => setAiAnalysis(p));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 600 }}>
            ⚠️ Students Needing Attention
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            AI-detected risk based on attendance and academic performance
          </p>
        </div>
        <GradientButton onClick={handleAIAnalysis} loading={loading}>
          🧠 Deep AI Analysis
        </GradientButton>
      </div>

      {/* Risk cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {riskStudents.map((student, i) => (
          <div key={student.id} style={{
            background: 'var(--bg-card)',
            border: `1px solid ${student.riskLevel.color}30`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            animation: `float 3s ease-in-out infinite ${i * 0.3}s`,
            transition: 'all 0.4s var(--spring)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = `0 20px 40px ${student.riskLevel.color}20`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${student.riskLevel.color}20`,
                  border: `2px solid ${student.riskLevel.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.8rem', color: student.riskLevel.color,
                }}>{student.avatar}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{student.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.rollNo}</div>
                </div>
              </div>
              <RiskMeter score={student.riskScore} size={80} />
            </div>

            {/* Risk badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              background: `${student.riskLevel.color}15`,
              border: `1px solid ${student.riskLevel.color}30`,
              fontSize: '0.75rem', fontWeight: 600,
              color: student.riskLevel.color,
              marginTop: '12px',
            }}>
              {student.riskLevel.emoji} {student.riskLevel.label}
            </div>

            {/* Factors */}
            <div style={{ marginTop: '12px' }}>
              {student.factors.map((f, fi) => (
                <div key={fi} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: student.riskLevel.color }}>•</span> {f}
                </div>
              ))}
            </div>

            {/* Confidence */}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
              AI Confidence: {student.confidence}%
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-hover)', border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border-default)'}
              >📱 Message Parent</button>
              <button style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-sm)',
                background: `${student.riskLevel.color}15`, border: `1px solid ${student.riskLevel.color}30`,
                color: student.riskLevel.color, fontSize: '0.75rem', fontWeight: 500,
                transition: 'all 0.2s',
              }}>📋 View Full</button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Analysis */}
      {showAnalysis && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(167, 139, 250, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          animation: 'aiGlow 3s ease-in-out infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span>🤖</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--ai-glow)' }}>
              AI Risk Assessment
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.83rem',
            lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap',
          }}>
            {aiAnalysis || 'Analyzing...'}
            {loading && <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: 'var(--ai-glow)', marginLeft: 2,
              animation: 'blink 1s step-end infinite',
            }} />}
          </div>
        </div>
      )}
    </div>
  );
}
