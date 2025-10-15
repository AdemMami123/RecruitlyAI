/**
 * API Route: Generate AI Test
 * POST /api/ai/generate-test
 * 
 * Generates technical assessment questions using Gemini AI
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateTest, GenerateTestParams } from "@/lib/ai/test-generator";

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

    // Check if user is HR
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "hr") {
      return NextResponse.json(
        { error: "Only HR users can generate tests" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      jobTitle,
      jobDescription,
      skills,
      difficulty = "medium",
      questionCount = 10,
      topics,
      includeCode = false,
      includeEssay = false,
      testTitle,
      testDescription,
      duration,
      passingScore = 70,
    } = body;

    // Validate required fields
    if (!jobTitle || !jobDescription || !skills || skills.length === 0) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: jobTitle, jobDescription, skills",
        },
        { status: 400 }
      );
    }

    if (questionCount < 1 || questionCount > 50) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Generate test using AI
    const testParams: GenerateTestParams = {
      jobTitle,
      jobDescription,
      skills: Array.isArray(skills) ? skills : [skills],
      difficulty,
      questionCount,
      topics,
      includeCode,
      includeEssay,
    };

    const generatedTest = await generateTest(testParams);

    // Save test to database
    const { data: test, error: testError } = await supabase
      .from("tests")
      .insert({
        created_by: user.id,
        title: testTitle || `${jobTitle} Assessment`,
        description:
          testDescription ||
          `AI-generated assessment for ${jobTitle} position`,
        duration_minutes: duration || generatedTest.metadata.estimatedDuration,
        passing_score: passingScore,
        total_points: generatedTest.metadata.totalPoints,
        ai_generated: true,
        is_published: false,
      })
      .select()
      .single();

    if (testError) {
      console.error("Error creating test:", testError);
      return NextResponse.json(
        { error: "Failed to save test to database" },
        { status: 500 }
      );
    }

    // Save questions to database
    const questionsToInsert = generatedTest.questions.map((q, index) => ({
      test_id: test.id,
      question_text: q.question,
      question_type: q.type,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points,
      order_index: index,
    }));

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert);

    if (questionsError) {
      console.error("Error creating questions:", questionsError);
      // Delete the test if questions failed to save
      await supabase.from("tests").delete().eq("id", test.id);
      return NextResponse.json(
        { error: "Failed to save questions to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        questionCount: generatedTest.questions.length,
        totalPoints: generatedTest.metadata.totalPoints,
        estimatedDuration: generatedTest.metadata.estimatedDuration,
        topicDistribution: generatedTest.metadata.topicDistribution,
      },
      questions: generatedTest.questions,
    });
  } catch (error: any) {
    console.error("Error generating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate test. Please try again." },
      { status: 500 }
    );
  }
}
