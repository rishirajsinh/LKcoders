export function buildFeedbackPrompt(student, marks) {
  return `You are an academic AI assistant for Edubase, an educational administration system. 
Analyze this student data and provide personalized feedback in a structured format.

Student: ${student.name} (${student.rollNo})
Class: ${student.class}

Subject Scores:
${Object.entries(marks).map(([subject, score]) => `- ${subject}: ${score}/100`).join('\n')}

Please provide:
1. Strengths (subjects scoring above 70)
2. Areas needing improvement (subjects below 50)
3. Predicted improvement with targeted practice
4. Specific actionable suggestions

Format with clear sections.`;
}

export function buildRiskPrompt(students, attendanceData, marksData) {
  return `You are an academic risk detection AI for Edubase. Analyze this class data and identify at-risk students.

Student Data:
${students.map(s => `- ${s.name}: Attendance ${attendanceData[s.id]}%, Avg Marks: ${marksData[s.id]}%`).join('\n')}

Identify students at risk of academic failure and provide:
1. Risk scores (0-100) for each at-risk student
2. Key risk factors
3. Intervention recommendations
4. Predicted outcomes without intervention

Format with severity levels: 🔴 CRITICAL, 🟠 HIGH, 🟡 NEEDS ATTENTION`;
}

export function buildStudyPlanPrompt(student, weakSubjects, availableHours) {
  return `You are a study plan generator for Edubase. Create a personalized daily study plan.

Student: ${student.name}
Weak Subjects: ${weakSubjects.join(', ')}
Available Study Hours: ${availableHours} hours per day

Generate an optimized study schedule that:
1. Prioritizes the weakest subjects
2. Includes breaks and revision
3. Uses morning for difficult topics
4. Includes specific chapter/topic recommendations

Format as a structured daily schedule with time slots, subjects, and specific tasks.`;
}

export function buildAttendancePrompt(attendanceData) {
  return `You are an attendance pattern analyzer for Edubase. Analyze this monthly attendance data and find patterns.

Attendance Data: ${JSON.stringify(attendanceData)}

Identify:
1. Day-of-week patterns
2. Trend analysis (improving/declining)
3. Individual student concerns
4. Recommendations for improvement

Use data-driven insights with percentages and specific observations.`;
}

export function buildPredictionPrompt(student, historicalMarks) {
  return `You are a performance predictor for Edubase. Predict end-term scores based on historical data.

Student: ${student.name}
Historical Scores: ${JSON.stringify(historicalMarks)}

Provide:
1. Predicted end-term score per subject
2. Confidence level
3. Trend direction (improving/stable/declining)
4. Key factors affecting prediction`;
}

export function buildTeachingSuggestionPrompt(classData) {
  return `You are a teaching suggestions engine for Edubase. Based on class performance data, suggest improvements.

Class Performance: ${JSON.stringify(classData)}

Provide:
1. Subject-specific teaching strategies
2. Scheduling optimizations
3. Student engagement techniques
4. Assessment methodology improvements

Be specific and actionable with data-backed reasoning.`;
}
