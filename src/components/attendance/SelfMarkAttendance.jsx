import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const SelfMarkAttendance = ({ userClass, userDivision, onComplete }) => {
  const [isMarking, setIsMarking] = useState(false);
  const { getAuthHeaders, API_URL } = useAuth();
  const { success, error, info } = useNotification();

  const handleMarkAttendance = async () => {
    setIsMarking(true);
    try {
      const res = await axios.post(
        `${API_URL}/attendance/mark`,
        {
          method: 'self',
          class: userClass,
          division: userDivision
        },
        { headers: getAuthHeaders() }
      );

      if (res.data.success) {
        success('Success! Your attendance has been marked.');
        if (onComplete) onComplete();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance.';
      if (msg.includes('IP mismatch')) {
        error('You must be on the same network as your teacher.');
      } else {
        info(msg);
      }
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <div className="self-mark-attendance" style={{ textAlign: 'center', padding: '20px' }}>
      <h3>Self-Mark Attendance</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Note: You must be connected to the school's Wi-Fi network.
      </p>
      
      <button
        onClick={handleMarkAttendance}
        disabled={isMarking}
        style={{
          padding: '15px 30px',
          background: 'var(--success)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s',
          opacity: isMarking ? 0.7 : 1
        }}
        onMouseDown={(e) => e.target.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
      >
        {isMarking ? 'Verifying IP...' : 'Mark Me Present'}
      </button>
    </div>
  );
};

export default SelfMarkAttendance;
