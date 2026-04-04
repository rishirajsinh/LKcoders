import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const StudentAssessmentView = ({ assessmentId, onComplete }) => {
  const { getAuthHeaders, API_URL } = useAuth();
  const { success, info } = useNotification();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await axios.get(`${API_URL}/student/assessment/${assessmentId}`, { headers: getAuthHeaders() });
        setAssessment(res.data.data);
        // Initialize empty answers
        const initialAnswers = res.data.data.questions.map(q => ({ questionId: q.id, answerText: '' }));
        setAnswers(initialAnswers);
      } catch (err) {
        info('Failed to load assessment.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [assessmentId]);

  const updateAnswer = (questionId, text) => {
    setAnswers(answers.map(a => a.questionId === questionId ? { ...a, answerText: text } : a));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/grading/submit`, { assessmentId, answers }, { headers: getAuthHeaders() });
      success('Submission successful! AI is now grading your work.');
      if (onComplete) onComplete();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to submit assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading assessment...</p>;
  if (!assessment) return <p>Assessment not found.</p>;

  const cardStyle = { padding: '20px', background: 'var(--bg-card)', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-default)' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-deep)', color: 'var(--text-primary)', minHeight: '100px', resize: 'vertical' };

  return (
    <div className="student-assessment-view">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{assessment.title}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Subject: {assessment.subject} | Due: {new Date(assessment.dueDate).toLocaleDateString()}</p>
      </div>

      {assessment.questions.map((q, idx) => (
        <div key={q.id} style={cardStyle}>
          <h4 style={{ marginBottom: '12px' }}>Question {idx + 1} ({q.maxScore} Marks)</h4>
          <p style={{ marginBottom: '15px', lineHeight: 1.6 }}>{q.text}</p>
          <textarea
            placeholder="Type your answer here..."
            style={inputStyle}
            value={answers.find(a => a.questionId === q.id)?.answerText || ''}
            onChange={e => updateAnswer(q.id, e.target.value)}
          />
        </div>
      ))}

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          style={{ 
            padding: '12px 30px', 
            borderRadius: '50px', 
            background: 'linear-gradient(135deg, var(--cyan), var(--emerald))', 
            color: 'white', 
            border: 'none', 
            fontWeight: 700, 
            cursor: 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Submitting...' : 'Submit All Answers'}
        </button>
      </div>
    </div>
  );
};

export default StudentAssessmentView;
