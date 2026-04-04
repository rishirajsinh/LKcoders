import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const FaceAttendance = ({ userClass, userDivision, onComplete }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { getAuthHeaders, API_URL, user } = useAuth();
  const { success, info } = useNotification();

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // Ensure models are in public/models
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        info('Face models not found. Please ensure they are in /public/models');
      }
    };
    loadModels();
  }, []);

  const handleCapture = async () => {
    if (!modelsLoaded || isVerifying) return;
    setIsVerifying(true);

    try {
      // 1. Detect face and get descriptor
      const detection = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        info('No face detected. Please adjust your position.');
        setIsVerifying(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      // 2. Fetch stored descriptor from DB (Student profile)
      // Note: In a real app, the backend should handle the comparison for security.
      // But user requested face-api.js setup in React.
      
      const res = await axios.post(
        `${API_URL}/attendance/mark`,
        {
          method: 'face',
          faceConfidence: detection.detection.score,
          class: userClass,
          division: userDivision,
          descriptor // Send descriptor to backend for comparison
        },
        { headers: getAuthHeaders() }
      );

      success('Face verified! Attendance marked.');
      if (onComplete) onComplete();
    } catch (err) {
      info(err.response?.data?.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (modelsLoaded) startVideo();
  }, [modelsLoaded]);

  return (
    <div className="face-attendance-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h3 style={{ marginBottom: '15px' }}>Face Recognition Attendance</h3>
      
      <div style={{ position: 'relative', display: 'inline-block', borderRadius: '12px', overflow: 'hidden', border: '3px solid var(--primary)' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          style={{ transform: 'scaleX(-1)' }} // Mirror view
        />
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>

      <div style={{ marginTop: '20px' }}>
        {!modelsLoaded ? (
          <p>Loading models...</p>
        ) : (
          <button 
            onClick={handleCapture} 
            disabled={isVerifying}
            style={{
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              opacity: isVerifying ? 0.7 : 1
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Mark Present'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceAttendance;
