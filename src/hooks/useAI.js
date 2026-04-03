import { useState, useCallback } from 'react';

export default function useAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const generateResponse = useCallback(async (prompt, onStream) => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      // Try real API first
      const apiKey = localStorage.getItem('eduflow_api_key');
      
      if (apiKey) {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.content[0].text;
          
          // Typewriter effect
          if (onStream) {
            for (let i = 0; i < text.length; i++) {
              await new Promise(r => setTimeout(r, 15));
              onStream(text.slice(0, i + 1));
            }
          }
          
          setResponse(text);
          setLoading(false);
          return text;
        }
      }

      // Fallback to simulated AI response
      const simulatedResponse = getSimulatedResponse(prompt);
      
      if (onStream) {
        for (let i = 0; i < simulatedResponse.length; i++) {
          await new Promise(r => setTimeout(r, 15));
          onStream(simulatedResponse.slice(0, i + 1));
        }
      }

      setResponse(simulatedResponse);
      setLoading(false);
      return simulatedResponse;
    } catch (err) {
      // Fallback 
      const fallback = getSimulatedResponse(prompt);
      if (onStream) {
        for (let i = 0; i < fallback.length; i++) {
          await new Promise(r => setTimeout(r, 15));
          onStream(fallback.slice(0, i + 1));
        }
      }
      setResponse(fallback);
      setLoading(false);
      return fallback;
    }
  }, []);

  return { loading, response, error, generateResponse };
}

function getSimulatedResponse(prompt) {
  const lower = prompt.toLowerCase();

  // 1. Check for Academic/Teacher Specifics First
  if (lower.includes('feedback') || lower.includes('report')) {
    return `🤖 AI Analysis Report\n\n✅ Strengths Identified:\n• Strong performance in Science (89/100) and English (84/100)\n• Consistent attendance record showing dedication\n• Improvement trend visible in last 3 assessments\n\n⚠️ Areas Needing Attention:\n• Mathematics (41/100) — Algebra and Trigonometry concepts need reinforcement\n• Problem-solving speed is below class average\n\n💡 Suggestions:\n• Assign Chapter 3-5 revision exercises\n• Pair with Sneha P. (top Math performer) for peer tutoring\n• Schedule weekly 1-on-1 doubt clearing sessions`;
  }

  if (lower.includes('risk') || lower.includes('at-risk')) {
    return `⚠️ Risk Assessment Report\n\n🔴 CRITICAL RISK — 3 Students Identified:\n\n1. Rahul Kumar (STU003)\n   • Risk Score: 87/100 (CRITICAL)\n   • Action: Immediate parent meeting required\n\n2. Dev Joshi (STU007)\n   • Risk Score: 82/100 (CRITICAL)\n   • Action: Assign tutoring + counselor referral\n\n3. Vikram Desai (STU009)\n   • Risk Score: 78/100 (HIGH)\n   • Action: Weekly progress monitoring`;
  }

  // 2. Handle General Knowledge / ChatGPT-style queries
  if (lower.includes('capital') || lower.includes('city')) {
    return `🌍 I can help with geography! \n\nIf you're asking about major capitals: \n• France: Paris \n• India: New Delhi \n• UK: London \n• USA: Washington, D.C.\n\nIs there a specific country you'd like to know more about?`;
  }

  if (lower.includes('solve') || lower.includes('math') || lower.includes('calculate')) {
    return `🔢 Mathematical Assistance\n\nI can help you solve complex problems. For example, to solve a quadratic equation (ax² + bx + c = 0), we use the quadratic formula:\n\nx = [-b ± sqrt(b² - 4ac)] / 2a\n\nPlease provide your specific equation and I'll walk you through the steps!`;
  }

  if (lower.includes('history') || lower.includes('who was') || lower.includes('when did')) {
    return `📜 Historical Context\n\nI have extensive knowledge of world history. Whether it's the Industrial Revolution, Ancient Civilizations, or modern geopolitical shifts, feel free to ask. \n\nFor example, the French Revolution began in 1789, fundamentally changing world history. What specific era are you interested in?`;
  }

  if (lower.includes('science') || lower.includes('physics') || lower.includes('biology')) {
    return `🔬 Scientific Inquiry\n\nI can explain everything from Photosynthesis to Quantum Mechanics. \n\nQuick Fact: Gravity is a fundamental force that attracts any two objects with mass. On Earth, it accelerates objects at approximately 9.8 m/s².\n\nWhat scientific concept should we explore?`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `👋 Namaste! I am your EduBase AI assistant. \n\nMain aapki class analytics, lesson planning, ya kisi bhi subject ke sawalon mein help kar sakta hoon. Aaj main aapki kaise madad karoon?`;
  }

  if (lower.includes('kaise') || lower.includes('help') || lower.includes('madad')) {
    return `🤝 Main aapki har tarah se help kar sakta hoon! \n\nAap mujhse analytics report mang sakte hain, ya phir kisi mushkil topic ko Hinglish mein samajh sakte hain. Bas apna sawal yahan likhiye.`;
  }

  // 3. Smart Universal Fallback
  return `🤖 EduBase AI Assistant\n\nMaine aapka query analyze kiya: "${prompt}"\n\nAs your assistant, main ye sab bata sakta hoon:\n• 📘 Academic Support (Hinglish mein explanation)\n• 📊 Student Data Analysis\n• 🌍 General Knowledge\n• ✉️ Drafting Messages\n\nAap apna sawal thoda detail mein puchiye, main turant jawab dunga!`;
}
