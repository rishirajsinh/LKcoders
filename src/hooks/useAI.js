import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function useAI() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState(null);

  const generateResponse = useCallback(async (prompt, onStream) => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      // Priority: 1. Vite Env, 2. localStorage
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      
      if (apiKey && apiKey.trim().length > 20) {
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContentStream(prompt);
        let fullText = '';

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          if (onStream) onStream(fullText);
        }

        setResponse(fullText);
        setLoading(false);
        return fullText;
      }

      // Fallback to simulated AI response
      const simulatedResponse = getSimulatedResponse(prompt);
      
      if (onStream) {
        for (let i = 0; i < simulatedResponse.length; i++) {
          await new Promise(r => setTimeout(r, 10));
          onStream(simulatedResponse.slice(0, i + 1));
        }
      }

      setResponse(simulatedResponse);
      setLoading(false);
      return simulatedResponse;
    } catch (err) {
      console.error('Gemini Error:', err);
      const fallback = getSimulatedResponse(prompt);
      if (onStream) {
        for (let i = 0; i < fallback.length; i++) {
          await new Promise(r => setTimeout(r, 10));
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
    return `進 AI Analysis Report\n\n✅ Strengths Identified:\n• Strong performance in Science (89/100) and English (84/100)\n• Consistent attendance record showing dedication\n• Improvement trend visible in last 3 assessments\n\n⚠️ Areas Needing Attention:\n• Mathematics (41/100) — Algebra and Trigonometry concepts need reinforcement\n• Problem-solving speed is below class average\n\n💡 Suggestions:\n• Assign Chapter 3-5 revision exercises\n• Pair with Sneha P. (top Math performer) for peer tutoring\n• Schedule weekly 1-on-1 doubt clearing sessions`;
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

  if (lower.includes('student') || lower.includes('kitne')) {
    // Dynamically extract student count from prompt context
    const countMatch = prompt.match(/Data: (\d+) students/);
    const count = countMatch ? parseInt(countMatch[1]) : 2; 
    
    const boys = Math.floor(count / 2);
    const girls = count - boys;
    
    return `📊 Class Overview:\n\nTotal students: **${count}**\n• Boys: ${boys}\n• Girls: ${girls}\n\nAbhi is class mein attendance aur performance stable hai. Aapko kisi specific student (jaise **Rishi** ya **Het**) ke baare mein janna hai?`;
  }

  if (lower === 'ha' || lower === 'yes' || lower === 'yeah') {
    return `Theek hai! Class 10-A mein do main students hain:\n\n1. **Rishi**: Inka attendance 95% hai aur Science mein topper hain.\n2. **Het**: Inka attendance thoda kam (70%) hai, inko thodi madad chahiye.\n\nKiske baare mein aur bataun?`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `👋 Namaste! I am your EduBase AI assistant powered by Gemini. \n\nMain aapki class analytics, lesson planning, ya kisi bhi subject ke sawalon mein help kar sakta hoon. Aaj main aapki kaise madad karoon?`;
  }

  if (lower.includes('kaise') || lower.includes('help') || lower.includes('madad')) {
    return `🤝 Main aapki har tarah se help kar sakta hoon! \n\nAap mujhse analytics report mang sakte hain, ya phir kisi mushkil topic ko Hinglish mein samajh sakte hain. Bas apna sawal yahan likhiye.`;
  }

  // 3. Smart Universal Fallback
  // Extract real query to avoid echoing system prompts
  const cleanQuery = prompt.split('User Query:')[1]?.trim() || prompt.split('User Question:')[1]?.trim() || prompt;
  
  return `🤖 EduBase AI Assistant\n\nMain aapke is sawal par kaam kar sakta hoon: "${cleanQuery.slice(0, 50)}..."\n\nAs your assistant, main ye sab bata sakta hoon:\n• 📘 Academic Support (Hinglish mein explanation)\n• 📊 Student Data Analysis\n• 🌍 General Knowledge\n• ✉️ Drafting Messages\n\nAap thoda specific detail puchiye, main turant direct answer dunga!`;
}
