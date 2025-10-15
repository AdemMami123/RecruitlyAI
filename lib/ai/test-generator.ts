/**
 * AI Test Generation Module
 * Generates technical assessment questions using Gemini 2.0 Flash
 */

import { generateContent, retryWithBackoff, parseAIResponse } from "./gemini-client";

export interface TestQuestion {
  question: string;
  type: "multiple_choice" | "true_false" | "code" | "essay";
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  points: number;
}

export interface GenerateTestParams {
  jobTitle: string;
  jobDescription: string;
  skills: string[];
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionCount: number;
  topics?: string[];
  includeCode?: boolean;
  includeEssay?: boolean;
}

export interface GenerateTestResult {
  questions: TestQuestion[];
  metadata: {
    totalPoints: number;
    estimatedDuration: number;
    topicDistribution: Record<string, number>;
  };
}

/**
 * Generate a technical assessment test using Gemini AI
 */
export async function generateTest(
  params: GenerateTestParams
): Promise<GenerateTestResult> {
  const prompt = buildTestGenerationPrompt(params);

  const responseText = await retryWithBackoff(() =>
    generateContent(prompt, "testGeneration")
  );

  const parsed = parseAIResponse(responseText);

  // Validate and normalize questions
  const questions: TestQuestion[] = (parsed.questions || []).map((q: any) => ({
    question: q.question,
    type: q.type || "multiple_choice",
    options: q.options || [],
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty || "medium",
    topic: q.topic || "General",
    points: q.points || 10,
  }));

  // Calculate metadata
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const estimatedDuration = Math.ceil(questions.length * 2); // 2 minutes per question

  const topicDistribution: Record<string, number> = {};
  questions.forEach((q) => {
    topicDistribution[q.topic] = (topicDistribution[q.topic] || 0) + 1;
  });

  return {
    questions,
    metadata: {
      totalPoints,
      estimatedDuration,
      topicDistribution,
    },
  };
}

/**
 * Build the prompt for test generation
 */
function buildTestGenerationPrompt(params: GenerateTestParams): string {
  const {
    jobTitle,
    jobDescription,
    skills,
    difficulty,
    questionCount,
    topics,
    includeCode,
    includeEssay,
  } = params;

  const topicsText =
    topics && topics.length > 0
      ? `Focus on these specific topics: ${topics.join(", ")}`
      : "Cover a broad range of relevant topics";

  const questionTypes: string[] = ["multiple_choice", "true_false"];
  if (includeCode) questionTypes.push("code");
  if (includeEssay) questionTypes.push("essay");

  return `You are an expert technical recruiter creating an assessment test.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Required Skills: ${skills.join(", ")}
Difficulty Level: ${difficulty}
Number of Questions: ${questionCount}
${topicsText}

Generate ${questionCount} technical assessment questions with the following requirements:

1. Question Types: Use a mix of ${questionTypes.join(", ")}
2. Difficulty: ${
    difficulty === "mixed"
      ? "Mix of easy (30%), medium (50%), hard (20%)"
      : `All ${difficulty} level`
  }
3. Coverage: Ensure questions cover the required skills and topics comprehensively
4. Real-world relevance: Questions should be practical and job-relevant
5. Clear explanations: Provide detailed explanations for correct answers

For each question, provide:
- question: The question text
- type: One of ${questionTypes.join(", ")}
- options: Array of 4 options (for multiple_choice), or ["True", "False"] (for true_false)
- correct_answer: The correct answer(s)
- explanation: Detailed explanation of why the answer is correct
- difficulty: easy, medium, or hard
- topic: The specific topic/skill being tested
- points: Points for this question (easy: 5, medium: 10, hard: 15)

Return the response as a valid JSON object with this exact structure:
{
  "questions": [
    {
      "question": "string",
      "type": "multiple_choice",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_answer": "option1",
      "explanation": "string",
      "difficulty": "medium",
      "topic": "string",
      "points": 10
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;
}

/**
 * Generate additional questions for an existing test
 */
export async function generateAdditionalQuestions(
  existingQuestions: TestQuestion[],
  params: Partial<GenerateTestParams> & { questionCount: number }
): Promise<TestQuestion[]> {
  const existingTopics = existingQuestions.map((q) => q.topic);
  const existingQuestionTexts = existingQuestions.map((q) => q.question);

  const prompt = `Generate ${params.questionCount} additional technical assessment questions that are different from these existing questions:

Existing topics: ${existingTopics.join(", ")}
Existing questions (avoid duplicates):
${existingQuestionTexts.slice(0, 5).join("\n")}

${params.jobTitle ? `Job Title: ${params.jobTitle}` : ""}
${params.skills ? `Skills: ${params.skills.join(", ")}` : ""}
${params.difficulty ? `Difficulty: ${params.difficulty}` : ""}

Return ONLY a valid JSON array of questions with the same structure as before.`;

  const responseText = await retryWithBackoff(() =>
    generateContent(prompt, "testGeneration")
  );

  const parsed = parseAIResponse(responseText);
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
}
