/**
 * AI Candidate Analysis Module
 * Analyzes candidate test performance using Gemini 2.0 Flash
 */

import { generateContent, retryWithBackoff, parseAIResponse } from "./gemini-client";

export interface CandidateAnswer {
  questionId: string;
  question: string;
  candidateAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  points: number;
  earnedPoints: number;
  topic: string;
  difficulty: string;
}

export interface AnalysisResult {
  overallScore: number;
  percentile: number;
  strengths: {
    topic: string;
    score: number;
    description: string;
  }[];
  weaknesses: {
    topic: string;
    score: number;
    description: string;
    improvementSuggestions: string[];
  }[];
  recommendations: {
    priority: "high" | "medium" | "low";
    category: string;
    title: string;
    description: string;
    resources: string[];
  }[];
  summary: string;
  detailedFeedback: string;
  estimatedSkillLevel: "beginner" | "intermediate" | "advanced" | "expert";
  readinessScore: number;
}

export interface AnalyzeCandidateParams {
  candidateName: string;
  jobTitle: string;
  answers: CandidateAnswer[];
  totalPoints: number;
  earnedPoints: number;
  testDuration: number;
  actualDuration: number;
}

/**
 * Analyze candidate performance and generate insights
 */
export async function analyzeCandidatePerformance(
  params: AnalyzeCandidateParams
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(params);

  const responseText = await retryWithBackoff(() =>
    generateContent(prompt, "candidateAnalysis")
  );

  const parsed = parseAIResponse(responseText);

  const scorePercentage = (params.earnedPoints / params.totalPoints) * 100;
  const percentile = estimatePercentile(scorePercentage);

  return {
    overallScore: scorePercentage,
    percentile,
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    recommendations: parsed.recommendations || [],
    summary: parsed.summary || "Analysis completed.",
    detailedFeedback: parsed.detailedFeedback || parsed.summary || "",
    estimatedSkillLevel: parsed.estimatedSkillLevel || "intermediate",
    readinessScore: parsed.readinessScore || Math.round(scorePercentage),
  };
}

/**
 * Build the prompt for candidate analysis
 */
function buildAnalysisPrompt(params: AnalyzeCandidateParams): string {
  const {
    candidateName,
    jobTitle,
    answers,
    totalPoints,
    earnedPoints,
    testDuration,
    actualDuration,
  } = params;

  const scorePercentage = ((earnedPoints / totalPoints) * 100).toFixed(1);
  const timeEfficiency = ((actualDuration / testDuration) * 100).toFixed(1);

  // Group answers by topic
  const topicPerformance: Record<
    string,
    { correct: number; total: number; points: number; maxPoints: number }
  > = {};

  answers.forEach((answer) => {
    if (!topicPerformance[answer.topic]) {
      topicPerformance[answer.topic] = {
        correct: 0,
        total: 0,
        points: 0,
        maxPoints: 0,
      };
    }
    topicPerformance[answer.topic].total++;
    topicPerformance[answer.topic].maxPoints += answer.points;
    topicPerformance[answer.topic].points += answer.earnedPoints;
    if (answer.isCorrect) topicPerformance[answer.topic].correct++;
  });

  const topicSummary = Object.entries(topicPerformance)
    .map(([topic, stats]) => {
      const percentage = ((stats.points / stats.maxPoints) * 100).toFixed(1);
      return `- ${topic}: ${stats.correct}/${stats.total} correct (${percentage}% score)`;
    })
    .join("\n");

  const incorrectAnswers = answers
    .filter((a) => !a.isCorrect)
    .map(
      (a) =>
        `Q: ${a.question}\nCandidate Answer: ${JSON.stringify(a.candidateAnswer)}\nCorrect Answer: ${JSON.stringify(a.correctAnswer)}\nTopic: ${a.topic}`
    )
    .join("\n\n");

  return `You are an expert technical recruiter analyzing candidate performance for the position of ${jobTitle}.

Candidate: ${candidateName}
Overall Score: ${earnedPoints}/${totalPoints} points (${scorePercentage}%)
Time Efficiency: ${timeEfficiency}% (completed in ${actualDuration} min of ${testDuration} min allowed)
Total Questions: ${answers.length}

Performance by Topic:
${topicSummary}

Incorrect or Partially Correct Answers:
${incorrectAnswers || "None - all answers were correct!"}

Based on this performance data, provide a comprehensive analysis with:

1. **Strengths**: Identify 2-3 areas where the candidate performed well
2. **Weaknesses**: Identify 2-3 areas needing improvement with specific suggestions
3. **Recommendations**: Provide 3-5 actionable recommendations prioritized by importance
4. **Overall Summary**: A brief paragraph summarizing the candidate's readiness for the role
5. **Skill Level Estimation**: Assess if the candidate is beginner, intermediate, advanced, or expert
6. **Readiness Score**: On a scale of 0-100, how ready is the candidate for this role?

Return the response as a valid JSON object with this exact structure:
{
  "strengths": [
    {
      "topic": "string",
      "score": 85,
      "description": "string explaining what they did well"
    }
  ],
  "weaknesses": [
    {
      "topic": "string",
      "score": 45,
      "description": "string explaining the weakness",
      "improvementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "category": "Learning",
      "title": "string",
      "description": "string",
      "resources": ["resource 1", "resource 2"]
    }
  ],
  "summary": "A comprehensive paragraph summarizing the analysis",
  "detailedFeedback": "Detailed paragraph with specific insights and observations",
  "estimatedSkillLevel": "intermediate",
  "readinessScore": 75
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Estimate percentile based on score
 */
function estimatePercentile(score: number): number {
  if (score >= 90) return 95;
  if (score >= 80) return 85;
  if (score >= 70) return 70;
  if (score >= 60) return 55;
  if (score >= 50) return 40;
  if (score >= 40) return 25;
  return 10;
}

/**
 * Generate quick feedback for a single question
 */
export async function generateQuickFeedback(
  question: string,
  candidateAnswer: string,
  correctAnswer: string,
  isCorrect: boolean
): Promise<string> {
  if (isCorrect) {
    return "Correct! Well done.";
  }

  const prompt = `Provide a brief, encouraging explanation for why this answer is incorrect and what the correct approach should be:

Question: ${question}
Candidate Answer: ${candidateAnswer}
Correct Answer: ${correctAnswer}

Keep the feedback constructive, brief (2-3 sentences), and educational.`;

  const feedback = await retryWithBackoff(() =>
    generateContent(prompt, "quickResponse")
  );

  return feedback.trim();
}

/**
 * Generate learning path recommendations
 */
export async function generateLearningPath(
  weaknesses: AnalysisResult["weaknesses"],
  targetRole: string
): Promise<{
  phases: {
    phase: number;
    title: string;
    duration: string;
    topics: string[];
    resources: string[];
    milestones: string[];
  }[];
}> {
  const weaknessTopics = weaknesses
    .map((w) => `${w.topic} (score: ${w.score}%)`)
    .join(", ");

  const prompt = `Create a structured learning path to help a candidate improve for the role of ${targetRole}.

Current Weaknesses:
${weaknessTopics}

Generate a 3-phase learning plan (Foundation → Intermediate → Advanced) with:
- Phase duration
- Topics to cover
- Resource recommendations
- Milestones to achieve

Return as JSON with structure:
{
  "phases": [
    {
      "phase": 1,
      "title": "Foundation Phase",
      "duration": "2-4 weeks",
      "topics": ["topic1", "topic2"],
      "resources": ["resource1", "resource2"],
      "milestones": ["milestone1", "milestone2"]
    }
  ]
}`;

  const responseText = await retryWithBackoff(() =>
    generateContent(prompt, "candidateAnalysis")
  );

  return parseAIResponse(responseText);
}
