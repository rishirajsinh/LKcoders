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
  // Extract real user query
  const cleanQuery = (prompt.split('User Query:')[1] || prompt.split('User Question:')[1] || prompt).trim();
  const lower = cleanQuery.toLowerCase();

  // 1. Data-Driven Extraction: Parse STUDENT_DATA from the system prompt
  const dataBlock = prompt.split('STUDENT_DATA:')[1]?.split('Data Summary:')[0]?.trim() || '';
  const students = dataBlock.split(' | ').filter(s => s.includes(':')).map(s => {
    const [name, rest] = s.split(': ');
    const percentage = parseInt(rest.match(/Attendance (\d+)%/)?.[1] || '0');
    return { name, percentage, raw: s };
  });

  // Utility to find specific stats
  const topper = students.length > 0 ? students.reduce((max, s) => s.percentage > max.percentage ? s : max, students[0]) : null;
  const lowest = students.length > 0 ? students.reduce((min, s) => s.percentage < min.percentage ? s : min, students[0]) : null;

  // 2. Handle Logic Based on Dynamic Data
  if (lower.includes('attenda') || lower.includes('presents') || lower.includes('absent')) {
    if (lower.includes('kam') || lower.includes('low') || lower.includes('sabse') || lower.includes('min')) {
      if (lowest) {
        return `📉 Sabse kam attendance **${lowest.name}** ki hai (${lowest.percentage}%). \n\nKya main inke liye alert generate karun?`;
      }
    }
    return `📊 Attendance Update:\n${students.map(s => `• ${s.name}: ${s.percentage}%`).join('\n')}\n\nAbhi class ki performance monitor ki ja rahi hai.`;
  }

  if (lower.includes('topper') || lower.includes('sabse accha') || lower.includes('top') || lower.includes('marks') || lower.includes('grade') || lower.includes('rank')) {
    if (topper) {
      return `🏆 Class Topper **${topper.name}** hain, jinka attendance record ${topper.percentage}% hai. \n\nBaki students ki progress bhi track ho rahi hai.`;
    }
  }

  // Handle specific names in the data
  const mentionedStudent = students.find(s => lower.includes(s.name.toLowerCase()));
  if (mentionedStudent) {
    return `👤 **Student Profile: ${mentionedStudent.name}**\n\n• **Attendance**: ${mentionedStudent.percentage}%\n• **Status**: ${mentionedStudent.percentage > 85 ? 'Excellent' : mentionedStudent.percentage > 60 ? 'Stable' : 'Needs Attention'}\n\nNote: Ye data aapke live dashboard se liya gaya hai.`;
  }

  // Constant Fallbacks
  if (lower.includes('student') || lower.includes('kitne')) {
    return `📊 Class Overview:\n\nTotal students: **${students.length}**\n\nAapko kisi specific student ke baare mein janna hai ya fir attendance report chahiye?`;
  }

  if (lower === 'ha' || lower === 'yes' || lower === 'yeah') {
    return `Theek hai! Main aapko ${students[0]?.name || 'students'} ki detail de sakta hoon ya topper list bata sakta hoon. Aap kya dekhna chahenge?`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `👋 Namaste! I am your EduBase AI assistant. \n\nMain aapke live class data (${students.length} students) ke basis pe analytics report de sakta hoon. Bolie kaise madad karoon?`;
  }

  // 4. Smart Universal Fallback
  return `🤖 EduBase AI Assistant\n\nMain aapke is sawal par kaam kar sakta hoon: "${cleanQuery.slice(0, 50)}..."\n\nMain aapke live data se ye bata sakta hoon:\n• 📊 Lowest Attendance (${lowest?.name || 'Search'})\n• 🏆 Class Topper (${topper?.name || 'Search'})\n• 📘 Academic Support\n\nAap be-jhijhak puchiye!`;
}
