/**
 * API Route: Analyze Test Results
 * POST /api/ai/analyze-results
 * GET /api/ai/analyze-results?testResultId=xxx
 * 
 * Analyzes candidate test performance using Gemini AI
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  analyzeCandidatePerformance,
  CandidateAnswer,
} from "@/lib/ai/candidate-analyzer";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { testResultId } = body;

    if (!testResultId) {
      return NextResponse.json(
        { error: "Missing required field: testResultId" },
        { status: 400 }
      );
    }

    // Fetch test result with related data
    const { data: testResult, error: resultError } = await supabase
      .from("test_results")
      .select(
        `
        *,
        test:tests(
          id,
          title,
          duration_minutes,
          total_points
        ),
        candidate:profiles!test_results_candidate_id_fkey(
          full_name,
          email
        )
      `
      )
      .eq("id", testResultId)
      .single();

    if (resultError || !testResult) {
      return NextResponse.json(
        { error: "Test result not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "hr" && testResult.candidate_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to analyze this test result" },
        { status: 403 }
      );
    }

    // Check if analysis already exists (cached)
    if (
      testResult.ai_analysis &&
      typeof testResult.ai_analysis === "object"
    ) {
      return NextResponse.json({
        success: true,
        cached: true,
        analysis: testResult.ai_analysis,
      });
    }

    // Fetch questions and answers
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("test_id", testResult.test_id)
      .order("order_index");

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: "Failed to fetch test questions" },
        { status: 500 }
      );
    }

    // Parse answers from test result
    const answers = testResult.answers || {};

    // Build candidate answers array
    const candidateAnswers: CandidateAnswer[] = questions.map((q) => {
      const candidateAnswer = answers[q.id] || "";
      const isCorrect = Array.isArray(q.correct_answer)
        ? JSON.stringify(candidateAnswer) ===
          JSON.stringify(q.correct_answer)
        : candidateAnswer === q.correct_answer;

      return {
        questionId: q.id,
        question: q.question_text,
        candidateAnswer,
        correctAnswer: q.correct_answer,
        isCorrect,
        points: q.points,
        earnedPoints: isCorrect ? q.points : 0,
        topic: extractTopic(q.explanation),
        difficulty:
          q.points <= 5 ? "easy" : q.points <= 10 ? "medium" : "hard",
      };
    });

    // Calculate total earned points
    const totalEarnedPoints = candidateAnswers.reduce(
      (sum, a) => sum + a.earnedPoints,
      0
    );

    // Calculate actual duration (in minutes)
    const startTime = new Date(testResult.started_at);
    const endTime = testResult.completed_at
      ? new Date(testResult.completed_at)
      : new Date();
    const actualDuration = Math.round(
      (endTime.getTime() - startTime.getTime()) / 60000
    );

    // Analyze performance using AI
    const analysis = await analyzeCandidatePerformance({
      candidateName: testResult.candidate?.full_name || "Candidate",
      jobTitle: testResult.test?.title || "Position",
      answers: candidateAnswers,
      totalPoints: testResult.test?.total_points || 0,
      earnedPoints: totalEarnedPoints,
      testDuration: testResult.test?.duration_minutes || 60,
      actualDuration,
    });

    // Save analysis to database (cache it)
    const { error: updateError } = await supabase
      .from("test_results")
      .update({
        ai_analysis: analysis,
        score: testResult.score || Math.round(analysis.overallScore),
      })
      .eq("id", testResultId);

    if (updateError) {
      console.error("Error saving analysis:", updateError);
      // Still return the analysis even if save failed
    }

    return NextResponse.json({
      success: true,
      cached: false,
      analysis,
    });
  } catch (error: any) {
    console.error("Error analyzing results:", error);
    return NextResponse.json(
      {
        error:
          error.message || "Failed to analyze test results. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/analyze-results?testResultId=xxx
 * Retrieve cached analysis
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const testResultId = searchParams.get("testResultId");

    if (!testResultId) {
      return NextResponse.json(
        { error: "Missing required parameter: testResultId" },
        { status: 400 }
      );
    }

    // Fetch test result
    const { data: testResult, error: resultError } = await supabase
      .from("test_results")
      .select("id, candidate_id, ai_analysis")
      .eq("id", testResultId)
      .single();

    if (resultError || !testResult) {
      return NextResponse.json(
        { error: "Test result not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "hr" && testResult.candidate_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this analysis" },
        { status: 403 }
      );
    }

    // Return cached analysis if available
    if (testResult.ai_analysis) {
      return NextResponse.json({
        success: true,
        cached: true,
        analysis: testResult.ai_analysis,
      });
    }

    return NextResponse.json({
      success: false,
      message: "Analysis not yet generated. Use POST to trigger analysis.",
    });
  } catch (error: any) {
    console.error("Error retrieving analysis:", error);
    return NextResponse.json(
      { error: "Failed to retrieve analysis" },
      { status: 500 }
    );
  }
}

/**
 * Helper function to extract topic from explanation
 */
function extractTopic(explanation: string | null): string {
  if (!explanation) return "General";
  
  // Try to extract topic from explanation (e.g., "JavaScript: This is about...")
  const colonIndex = explanation.indexOf(":");
  if (colonIndex > 0 && colonIndex < 30) {
    return explanation.substring(0, colonIndex).trim();
  }
  
  return "General";
}
