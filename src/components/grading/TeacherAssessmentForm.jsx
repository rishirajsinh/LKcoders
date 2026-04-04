import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const TeacherAssessmentForm = ({ onComplete }) => {
  const { getAuthHeaders, API_URL, user } = useAuth();
  const { success, info } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    class: user?.assignedClass || '',
    division: user?.assignedDivision || '',
    dueDate: '',
    gradingMode: 'auto',
    questions: [
      { id: 1, text: '', modelAnswer: '', rubric: '', maxScore: 10 }
    ]
  });

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        { id: formData.questions.length + 1, text: '', modelAnswer: '', rubric: '', maxScore: 10 }
      ]
    });
  };

  const updateQuestion = (id, field, value) => {
    const updated = formData.questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    setFormData({ ...formData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/grading/assessment`, formData, { headers: getAuthHeaders() });
      success('Assessment created successfully!');
      if (onComplete) onComplete();
    } catch (err) {
      info(err.response?.data?.message || 'Failed to create assessment.');
    }
  };

  const cardStyle = { padding: '20px', background: 'var(--bg-deep)', borderRadius: '12px', marginBottom: '16px', border: '1px solid var(--border-default)' };
  const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-card)', color: 'var(--text-primary)', marginBottom: '10px' };

  return (
    <div className="assessment-form-container">
      <h2 style={{ marginBottom: '20px' }}>Create New Assessment</h2>
      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <label>Assessment Title</label>
          <input 
            type="text" 
            placeholder="e.g. Midterm Physics Exam" 
            style={inputStyle} 
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            required 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label>Subject</label>
              <input type="text" style={inputStyle} value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
            </div>
            <div>
              <label>Due Date</label>
              <input type="date" style={inputStyle} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
          </div>
        </div>

        <h3 style={{ margin: '20px 0 10px' }}>Questions & Rubrics</h3>
        {formData.questions.map((q, idx) => (
          <div key={q.id} style={cardStyle}>
            <h4>Question {q.id}</h4>
            <textarea 
              placeholder="Question Text" 
              style={{...inputStyle, minHeight: '80px'}} 
              value={q.text}
              onChange={e => updateQuestion(q.id, 'text', e.target.value)}
            />
            <textarea 
              placeholder="Model Answer (for AI reference)" 
              style={{...inputStyle, minHeight: '60px'}} 
              value={q.modelAnswer}
              onChange={e => updateQuestion(q.id, 'modelAnswer', e.target.value)}
            />
            <textarea 
              placeholder="Grading Rubric (e.g. 5 marks for concept, 5 for formula)" 
              style={{...inputStyle, minHeight: '60px'}} 
              value={q.rubric}
              onChange={e => updateQuestion(q.id, 'rubric', e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Max Score:</label>
              <input 
                type="number" 
                style={{...inputStyle, width: '80px', marginBottom: 0}} 
                value={q.maxScore}
                onChange={e => updateQuestion(q.id, 'maxScore', parseInt(e.target.value))}
              />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={addQuestion} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'none', cursor: 'pointer' }}>
            + Add Question
          </button>
          <button type="submit" style={{ padding: '10px 30px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Publish Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherAssessmentForm;
