import { useState, useEffect, useRef } from 'react';
import useAI from '../../hooks/useAI';

export default function TeacherCoPilot({ students, overview, activeSection }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your EduBase Co-pilot. How can I help you today?" }
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

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');

    // Prepare context-aware prompt
    const contextPrompt = `
      Context: Teacher Dashboard, Section: ${activeSection}.
      Data: ${students?.length} students, Avg Attendance: ${overview?.averageAttendance}%.
      User Question: ${text}
    `;

    await generateResponse(contextPrompt, (chunk) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: chunk }];
        } else {
          return [...prev, { role: 'assistant', content: chunk }];
        }
      });
    });
  };

  const quickActions = [
    { label: '📊 Analyze Class', prompt: 'Summarize our current class performance and attendance patterns.' },
    { label: '⚠️ Find At-Risk', prompt: 'Identify students who are at risk based on their attendance and scores.' },
    { label: '💡 Teaching Tips', prompt: 'Give me 3 teaching strategies to improve engagement in my class.' },
    { label: '✉️ Draft Notice', prompt: 'Draft a professional notice for parents about an upcoming parent-teacher meeting.' }
  ];

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

      {/* Co-pilot Drawer */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '380px',
          height: '550px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
          animation: 'drawerSlide 0.4s var(--spring)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--primary), var(--violet))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{ fontSize: '1.2rem' }}>✨</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>EduBase Co-pilot</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Your Professional Teaching Assistant</div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'var(--bg-deep)',
            }}
          >
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                background: msg.role === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-default)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                whiteSpace: 'pre-wrap',
              }}>
                {msg.content}
              </div>
            ))}
            {loading && messages[messages.length - 1].role === 'user' && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Thinking...
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length < 3 && (
            <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid var(--border-default)' }}>
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)')}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div style={{ padding: '16px 20px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', display: 'flex', gap: '10px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: (loading || !input.trim()) ? 0.6 : 1,
              }}
            >
              ➝
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes drawerSlide {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
