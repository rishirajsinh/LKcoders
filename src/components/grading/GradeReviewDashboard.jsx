import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const GradeReviewDashboard = ({ assessmentId }) => {
  const { getAuthHeaders, API_URL } = useAuth();
  const { success, info } = useNotification();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_URL}/grading/assessment/${assessmentId}/submissions`, { headers: getAuthHeaders() });
      setSubmissions(res.data.data);
    } catch (err) {
      info('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assessmentId]);

  const handleGrade = async (submissionId) => {
    setGradingId(submissionId);
    try {
      await axios.post(`${API_URL}/grading/grade/${submissionId}`, {}, { headers: getAuthHeaders() });
      success('AI Grading complete!');
      fetchSubmissions();
    } catch (err) {
      info(err.response?.data?.message || 'AI Grading failed.');
    } finally {
      setGradingId(null);
    }
  };

  if (loading) return <p>Loading submissions...</p>;

  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thStyle = { textAlign: 'left', padding: '12px', borderBottom: '2px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '0.85rem' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid var(--border-default)', fontSize: '0.9rem' };

  return (
    <div className="grade-review-dashboard">
      <h3>Student Submissions</h3>
      
      {submissions.length === 0 ? (
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>No submissions yet.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Student Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total Score</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(sub => (
              <tr key={sub._id}>
                <td style={tdStyle}>{sub.studentId?.name}</td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    background: sub.status === 'graded' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: sub.status === 'graded' ? 'var(--emerald)' : 'var(--warning)'
                  }}>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>{sub.status === 'graded' ? `${sub.totalScore}` : '—'}</td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => handleGrade(sub._id)}
                    disabled={gradingId === sub._id || sub.status === 'graded'}
                    style={{ 
                      padding: '6px 14px', 
                      borderRadius: '6px', 
                      background: sub.status === 'graded' ? 'var(--bg-deep)' : 'var(--primary)',
                      color: sub.status === 'graded' ? 'var(--text-muted)' : 'white',
                      border: 'none',
                      cursor: sub.status === 'graded' ? 'default' : 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {gradingId === sub._id ? 'AI Grading...' : (sub.status === 'graded' ? 'Review Result' : 'Trigger AI Grade')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GradeReviewDashboard;
