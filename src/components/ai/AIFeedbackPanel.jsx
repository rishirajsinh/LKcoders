import { useState } from 'react';
import useAI from '../../hooks/useAI';
import GradientButton from '../ui/GradientButton';

export default function AIFeedbackPanel({ student, marks }) {
  const { loading, generateResponse } = useAI();
  const [feedback, setFeedback] = useState('');

  const handleGenerate = async () => {
    const marksStr = Object.entries(marks).map(([s, v]) => `${s}: ${v}/100`).join(', ');
    const prompt = `You are an academic AI assistant for Edubase. Analyze this student data and provide personalized feedback:\n\nStudent: ${student.name} (${student.rollNo})\nClass: ${student.class}\nSubject Scores: ${marksStr}\n\nProvide: strengths, areas needing improvement, predicted improvement, and specific suggestions.`;
    
    await generateResponse(prompt, (partial) => setFeedback(partial));
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(167, 139, 250, 0.3)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      animation: feedback ? 'aiGlow 3s ease-in-out infinite' : 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-default)',
        background: 'rgba(167, 139, 250, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--ai-glow)' }}>
            AI Feedback for {student.name}
          </span>
          {loading && (
            <div style={{ display: 'flex', gap: '3px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 4, height: 4, borderRadius: '50%', background: 'var(--ai-glow)',
                  animation: `typingDots 1.4s infinite ${i * 0.2}s`,
                }} />
              ))}
            </div>
          )}
        </div>
        <GradientButton size="sm" onClick={handleGenerate} loading={loading}>
          ✦ Generate Feedback
        </GradientButton>
      </div>
      <div style={{
        padding: '20px',
        minHeight: '100px',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.83rem',
        lineHeight: 1.8,
        color: 'var(--text-secondary)',
        whiteSpace: 'pre-wrap',
      }}>
        {feedback ? (
          <>
            {feedback}
            {loading && <span style={{
              display: 'inline-block', width: 2, height: '1em',
              background: 'var(--ai-glow)', marginLeft: 2, verticalAlign: 'text-bottom',
              animation: 'blink 1s step-end infinite',
            }} />}
          </>
        ) : (
          <div style={{ textAlign: 'center', opacity: 0.4, padding: '20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <p style={{ marginTop: 8 }}>Click generate to get AI-powered feedback</p>
          </div>
        )}
      </div>
    </div>
  );
}
