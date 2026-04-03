import { useState, useEffect, useRef } from 'react';
import useAI from '../../hooks/useAI';

// Simple Markdown-ish formatter
const formatMessage = (content) => {
  if (!content) return '';
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/• (.*?)\n/g, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
};

export default function TeacherCoPilot({ students, overview, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hello! I'm your EduBase AI Co-pilot. I can help with class analytics, lesson planning, or any general question you have. How can I assist you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const { loading, generateResponse } = useAI();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const text = customPrompt || input;
    if (!text.trim() || loading) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', content: text, time: userTime }]);
    setInput('');

    // Prepare student data for AI context
    const studentDataString = overview?.students?.map(s => 
      `${s.name}: Attendance ${s.percentage}%, Present ${s.present}, Absent ${s.absent}`
    ).join(' | ') || 'No student data available';

    // Prepare context-aware prompt
    const contextPrompt = `
      [SYSTEM]: You are a ChatGPT-style assistant. 
      IMPORTANT: Respond in Hinglish (a mix of Hindi and English) as the user prefers it.
      Mainly use English technical terms, but use Hindi for general explanation and conversation.
      Context: Teacher Dashboard, Section: ${activeSection}.
      STUDENT_DATA: ${studentDataString}
      Data Summary: ${students?.length} students, Avg Attendance: ${overview?.averageAttendance}%.
      User Query: ${text}
    `;

    await generateResponse(contextPrompt, (chunk) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === 'assistant') {
          return [...prev.slice(0, -1), { 
            role: 'assistant', 
            content: chunk, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }];
        } else {
          return [...prev, { 
            role: 'assistant', 
            content: chunk, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }];
        }
      });
    });
  };

  const startNewChat = () => {
    setMessages([
      { 
        role: 'assistant', 
        content: "New session started. How can I help you now?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--primary), var(--violet))',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.95rem',
          fontWeight: 700,
          zIndex: 9999,
          transition: 'all 0.3s var(--spring)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <span style={{ fontSize: '1.4rem' }}>{isOpen ? '✕' : '✨'}</span>
        <span>{isOpen ? 'Close Assistant' : 'AI Co-pilot'}</span>
      </button>

      {/* Co-pilot ChatGPT Interface */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '450px',
          height: '650px',
          maxWidth: '90vw',
          maxHeight: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden',
          animation: 'drawerSlide 0.4s var(--spring)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'var(--primary)', 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem'
              }}>✨</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>EduBase AI</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Always Online</div>
              </div>
            </div>
            <button 
              onClick={startNewChat}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-deep)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}
            >
              + New Chat
            </button>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '24px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              background: 'var(--bg-deep)',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '6px',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '14px 18px',
                  borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-default)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                }}>
                  <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '0 4px' }}>
                  {msg.time}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: '4px', padding: '12px' }}>
                <div className="dot-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s infinite' }}></div>
                <div className="dot-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s 0.2s infinite' }}></div>
                <div className="dot-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 1.2s 0.4s infinite' }}></div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div style={{ padding: '20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)' }}>
            <div style={{ 
              display: 'flex', 
              gap: '12px',
              background: 'var(--bg-deep)',
              padding: '8px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border-default)',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything (e.g. Solve x² + 5x + 6 = 0)"
                rows={1}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  resize: 'none',
                  padding: '8px 0',
                  maxHeight: '120px',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: (loading || !input.trim()) ? 0.4 : 1,
                  transition: 'all 0.2s',
                  alignSelf: 'flex-end',
                }}
              >
                ➝
              </button>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
              EduBase AI can make mistakes. Consider checking important info.
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </>
  );
}
