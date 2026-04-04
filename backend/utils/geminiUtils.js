const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Grades a student submission using Gemini 1.5 Pro
 * @param {Object} assessment - The assessment document with questions and rubrics
 * @param {Object} submission - The student's submission with answers
 * @returns {Promise<Object>} - Graded answers in JSON format
 */
async function gradeSubmission(assessment, submission) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

  // 1. Build the prompt
  let prompt = `You are an expert academic examiner. Grade the following student submission based on the provided questions, model answers, and rubrics. 
  
  Strictly follow these rules:
  1. Return ONLY a valid JSON object.
  2. For each question, provide a score (0 to maxScore), feedback (constructive and specific), and any matchedKeywords.
  3. Suggest if a teacher needs to review (set needsReview to true) if the answer is highly creative or ambiguous.
  4. Accuracy is paramount. Use the rubric strictly.

  Assessment Title: ${assessment.title}
  Subject: ${assessment.subject}

  Questions & Student Answers:
  ${assessment.questions.map(q => {
    const studentAnswer = submission.answers.find(a => a.questionId === q.id)?.answerText || "No answer provided.";
    return `
    ---
    Question ${q.id}: ${q.text}
    Max Score: ${q.maxScore}
    Model Answer: ${q.modelAnswer}
    Rubric: ${q.rubric}
    Student Answer: ${studentAnswer}
    ---`;
  }).join('\n')}

  Response Format (JSON):
  {
    "grades": [
      {
        "questionId": 1,
        "score": number,
        "feedback": "string",
        "matchedKeywords": ["string"],
        "aiConfidence": number (0 to 1),
        "needsReview": boolean
      }
    ],
    "totalScore": number,
    "overallFeedback": "string"
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON if Gemini adds markdown blocks
    const cleanedJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedJson);
  } catch (err) {
    console.error('Gemini Grading Error:', err);
    throw new Error('Failed to parse AI grading response.');
  }
}

module.exports = { gradeSubmission };
