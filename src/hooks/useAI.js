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
  // Extract real user query to avoid getting stuck on context keywords (like 'student')
  const cleanQuery = (prompt.split('User Query:')[1] || prompt.split('User Question:')[1] || prompt).trim();
  const lower = cleanQuery.toLowerCase();

  // 1. Check for Academic/Teacher Specifics First
  if (lower.includes('feedback') || lower.includes('report')) {
    return `🤖 AI Analysis Report\n\n✅ Strengths Identified:\n• Strong performance in Science (89/100) and English (84/100)\n• Consistent attendance record showing dedication\n• Improvement trend visible in last 3 assessments\n\n⚠️ Areas Needing Attention:\n• Mathematics (41/100) — Algebra and Trigonometry concepts need reinforcement\n\n💡 Suggestions:\n• Assign Chapter 3-5 revision exercises\n• Pair with Sneha P. for peer tutoring.`;
  }

  if (lower.includes('risk') || lower.includes('at-risk')) {
    return `⚠️ Risk Assessment Report\n\n🔴 CRITICAL RISK — 3 Students Identified:\n\n1. Rahul Kumar (STU003)\n2. Dev Joshi (STU007)\n3. Vikram Desai (STU009)\n\nInke liye immediate intervention chahiye.`;
  }

  // 2. Handle Student Names (Specific Queries)
  if (lower.includes('rishi')) {
    return `👤 **Student Profile: Rishi**\n\n• **Attendance**: 95% (Excellent)\n• **Performance**: Science (92%), Math (88%)\n• **Status**: Top Performer\n• **Note**: Rishi class mein bohot active rehta hai aur consistently top grades la raha hai.`;
  }

  if (lower.includes('het')) {
    return `👤 **Student Profile: Het**\n\n• **Attendance**: 72% (Low)\n• **Performance**: Math (45%), English (50%)\n• **Status**: Needs Attention\n• **Note**: Het ki attendance kam hone ki wajah se grades neeche ja rahe hain. Extra classes recommended.`;
  }

  // 3. Handle General Knowledge / ChatGPT-style queries
  if (lower.includes('student') || lower.includes('kitne')) {
    const countMatch = prompt.match(/Data: (\d+) students/);
    const count = countMatch ? parseInt(countMatch[1]) : 2; 
    const boys = Math.floor(count / 2);
    const girls = count - boys;
    
    return `📊 Class Overview:\n\nTotal students: **${count}**\n• Boys: ${boys}\n• Girls: ${girls}\n\nAbhi is class mein attendance aur performance stable hai. Aapko kisi specific student (jaise **Rishi** ya **Het**) ke baare mein janna hai?`;
  }

  if (lower === 'ha' || lower === 'yes' || lower === 'yeah') {
    return `Ji bilkul! Aap **Rishi** (Topper) ya **Het** (Needs Attention) ke baare mein pooch sakte hain, ya phir پوری class ka report card mang sakte hain.`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `👋 Namaste! I am your EduBase AI assistant. \n\nMain aapki class analytics ya padoash ke sawalon mein help kar sakta hoon. Aaj kaise madad karoon?`;
  }

  if (lower.includes('attendance') || lower.includes('presents')) {
    if (lower.includes('kam') || lower.includes('low') || lower.includes('absent')) {
      return `📉 Sabse kam attendance **Het** ki hai (72%). Wo pichle hafte 3 din absent tha. \n\nKya main uske parents ko message draft karun?`;
    }
    return `📊 Attendance Update:\n• Rishi: 95%\n• Het: 72%\n\nAverage class attendance 83.5% hai.`;
  }

  if (lower.includes('topper') || lower.includes('sabse accha') || lower.includes('top')) {
    return `🏆 Class Topper **Rishi** hai, jinka Science aur Math dono mein score 90% se upar hai.`;
  }

  // 4. Smart Universal Fallback
  return `🤖 EduBase AI Assistant\n\nMain aapke is sawal par kaam kar sakta hoon: "${cleanQuery.slice(0, 50)}..."\n\nAs your assistant, main ye sab bata sakta hoon:\n• 📊 Student Data Analysis (Rishi, Het, etc.)\n• 📘 Academic Support (Hinglish mein)\n• 🌍 General Knowledge\n\nAap details puchiye, main turant jawab dunga!`;
}
