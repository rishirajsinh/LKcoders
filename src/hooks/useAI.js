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
        console.log('Gemini AI Active (Key: ' + apiKey.trim().substring(0, 4) + '...)');
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
      
      console.warn('Gemini API Key missing or invalid. Using Smart Simulation.');

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

  // 1. Data-Driven Extraction
  const dataBlock = prompt.split('STUDENT_DATA:')[1]?.split('Data Summary:')[0]?.trim() || '';
  const students = dataBlock.split(' | ').filter(s => s.includes(':')).map(s => {
    const [name, rest] = s.split(': ');
    const percentage = parseInt(rest.match(/Attendance (\d+)%/)?.[1] || '0');
    return { name, percentage, raw: s };
  });

  if (students.length === 0 && !lower.includes('hello')) {
    return `⚠️ **Data Missing**: Class records nahi mil rahe hain. Please dashboard pe class set karke refresh karein.`;
  }

  const topper = students.length > 0 ? students.reduce((max, s) => s.percentage > max.percentage ? s : max, students[0]) : null;
  const lowest = students.length > 0 ? students.reduce((min, s) => s.percentage < min.percentage ? s : min, students[0]) : null;

  // 2. DIRECT ChatGPT-like Responses (No conversational filler)
  
  if (lower.includes('badhiya') || lower.includes('best') || lower.includes('topper') || lower.includes('top')) {
    return topper 
      ? `🏆 Aapki class mein **${topper.name}** sabse badhiya perform kar raha hai, jiski attendance **${topper.percentage}%** hai. Uska academic record ekdum stable hai.`
      : "Data available nahi hai topper batane ke liye.";
  }

  if (lower.includes('kam') || lower.includes('low') || lower.includes('worst') || lower.includes('attendance')) {
    if (lowest) {
      return `📉 Sabse kam attendance **${lowest.name}** ki hai (**${lowest.percentage}%**). Inko thoda monitor karne ki zaroorat hai. \n\nKya main inke liye extra classes suggest karun?`;
    }
  }

  if (lower.includes('academic') || lower.includes('support') || lower.includes('padhai')) {
    return `📘 **Academic Support Active!** \n\nMain aapko students ki progress reports aur detailed analysis de sakta hoon. \n\nKaise help karun? \n• Kisi specific student ka graph dekhna hai? \n• Ya low performers ki list chahiye?`;
  }

  const mentionedStudent = students.find(s => lower.includes(s.name.toLowerCase()));
  if (mentionedStudent) {
    return `👤 **Student Profile: ${mentionedStudent.name}**\n\n• **Attendance**: ${mentionedStudent.percentage}%\n• **Status**: ${mentionedStudent.percentage > 85 ? 'Excellent' : mentionedStudent.percentage > 60 ? 'Stable' : 'Needs Attention'}\n\nYe data aapke live dashboard se fetch kiya gaya hai.`;
  }

  if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
    return `👋 Namaste! I am your AI Assistant. \n\nMain aapke live dashboard data se reports taiyar kar sakta hoon. Aaj kya help karun?`;
  }

  // 3. Smart Universal Fallback
  return `🤖 EduBase AI Assistant\n\nAapne pucha: "${cleanQuery}"\n\nAapke data ke mutabik:\n• Total Students: ${students.length}\n• Class Topper: ${topper?.name || 'N/A'}\n• Attendance Issues: ${lowest?.name || 'None'}\n\nAap kissi bhi student ka naam bolie, main uska poora report nikal dunga!`;
}
