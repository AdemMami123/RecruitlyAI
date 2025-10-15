/**
 * Gemini AI REST API Client
 * Using Gemini 2.0 Flash model for test generation and candidate analysis
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash-exp"; // Using Gemini 2.0 Flash

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set in environment variables");
}

/**
 * Base URL for Gemini API
 */
const getGeminiUrl = (endpoint: string = "generateContent") => {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:${endpoint}?key=${GEMINI_API_KEY}`;
};

/**
 * Generation config for different use cases
 */
export const GENERATION_CONFIGS = {
  testGeneration: {
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  candidateAnalysis: {
    temperature: 0.4,
    topP: 0.8,
    topK: 20,
    maxOutputTokens: 4096,
  },
  quickResponse: {
    temperature: 0.7,
    topP: 0.9,
    topK: 30,
    maxOutputTokens: 2048,
  },
};

/**
 * Safety settings
 */
const SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

/**
 * Generate content using Gemini API
 */
export async function generateContent(
  prompt: string,
  configKey: keyof typeof GENERATION_CONFIGS = "quickResponse"
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const config = GENERATION_CONFIGS[configKey];
  const url = getGeminiUrl("generateContent");

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: config,
    safetySettings: SAFETY_SETTINGS,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error(`Gemini API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Extract text from response
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Invalid response format from Gemini API");
}

/**
 * Retry logic with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries === 0) {
      throw error;
    }

    // Check if it's a rate limit error
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      console.log(`Rate limited. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }

    throw error;
  }
}

/**
 * Parse JSON response from AI (handles markdown code blocks)
 */
export function parseAIResponse(text: string): any {
  try {
    // Remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/g, "");
    }

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse AI response as JSON");
  }
}
