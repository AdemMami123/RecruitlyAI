# Gemini API Setup Guide for Recruitly AI

## 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Click **"Create API key in new project"** or select an existing project
5. Copy the API key that appears
6. Add it to your `.env.local` file:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## 2. Understanding Gemini API

The Gemini API is Google's latest generative AI model that can:
- Generate text content
- Analyze and understand context
- Create structured data from descriptions
- Provide intelligent insights

### Models Available
- **gemini-pro** - Best for text-based tasks (recommended)
- **gemini-pro-vision** - For image and text tasks

## 3. Rate Limits (Free Tier)

- 60 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

**For Production:** Consider upgrading to a paid plan

## 4. Integration Examples

### Install the SDK

```bash
npm install @google/generative-ai
```

### Create a Helper Function

Create `lib/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateTest(jobDescription: string, skills: string[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
    Generate a technical skill test based on the following:
    
    Job Description: ${jobDescription}
    Required Skills: ${skills.join(', ')}
    
    Create 10 multiple-choice questions that test these skills.
    Format the response as JSON with this structure:
    {
      "questions": [
        {
          "id": 1,
          "question": "Question text here",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "difficulty": "easy|medium|hard",
          "skill": "skill name"
        }
      ]
    }
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  return JSON.parse(text)
}

export async function analyzeCandidatePerformance(
  questions: any[],
  answers: any[]
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = `
    Analyze this candidate's test performance:
    
    Questions and Answers:
    ${JSON.stringify({ questions, answers }, null, 2)}
    
    Provide a detailed analysis in JSON format:
    {
      "overallScore": 85,
      "strengths": ["Array of strength areas"],
      "weaknesses": ["Array of areas to improve"],
      "recommendations": ["Array of learning recommendations"],
      "skillBreakdown": {
        "skillName": { "score": 90, "comments": "comments here" }
      }
    }
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  
  return JSON.parse(text)
}
```

## 5. API Route Example

Create `app/api/generate-test/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { generateTest } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get request body
    const { jobDescription, skills } = await request.json()

    // Validate input
    if (!jobDescription || !skills || skills.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate test using Gemini
    const testData = await generateTest(jobDescription, skills)

    // Save to database (optional)
    const { data, error } = await supabase
      .from('tests')
      .insert({
        user_id: user.id,
        title: `Test for ${skills[0]}`,
        description: jobDescription,
        questions: testData.questions,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, test: data })
  } catch (error: any) {
    console.error('Error generating test:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate test' },
      { status: 500 }
    )
  }
}
```

## 6. Frontend Usage Example

Create a form to generate tests:

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export function TestGenerator() {
  const [jobDescription, setJobDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedTest, setGeneratedTest] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          skills: skills.split(',').map(s => s.trim())
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setGeneratedTest(data.test)
      } else {
        alert('Failed to generate test: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter job description..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        rows={6}
      />
      <Input
        placeholder="Enter skills (comma-separated): JavaScript, React, Node.js"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
      />
      <Button 
        onClick={handleGenerate} 
        disabled={loading}
        className="bg-gradient-to-r from-primary to-accent"
      >
        {loading ? 'Generating...' : 'Generate Test with AI'}
      </Button>

      {generatedTest && (
        <div className="mt-4 p-4 border rounded-lg">
          <h3 className="font-bold mb-2">Generated Test</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(generatedTest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
```

## 7. Best Practices

### 1. Error Handling
```typescript
try {
  const result = await generateTest(jobDescription, skills)
  return result
} catch (error) {
  if (error.message.includes('quota')) {
    // Handle rate limit
    return { error: 'Rate limit exceeded. Please try again later.' }
  }
  // Handle other errors
  return { error: 'Failed to generate test' }
}
```

### 2. Prompt Engineering
- Be specific and clear in your prompts
- Provide examples of expected output format
- Use structured data (JSON) for consistent results
- Include context about your application

### 3. Response Parsing
```typescript
// Always try to parse JSON responses
try {
  const parsed = JSON.parse(responseText)
  return parsed
} catch (e) {
  // Fallback if JSON parsing fails
  return { raw: responseText }
}
```

### 4. Caching
- Cache generated tests to avoid redundant API calls
- Store in database for reuse
- Implement client-side caching for frequently accessed data

## 8. Safety and Content Filtering

Gemini has built-in safety filters. Configure them:

```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
})
```

## 9. Cost Optimization Tips

1. **Batch requests** when possible
2. **Cache responses** in database
3. **Use shorter prompts** when appropriate
4. **Implement request queuing** to avoid rate limits
5. **Monitor usage** in Google Cloud Console

## 10. Testing Your Integration

Create a simple test script `scripts/test-gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

async function testGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  const prompt = 'Generate a simple programming question about JavaScript arrays'
  
  const result = await model.generateContent(prompt)
  const response = await result.response
  
  console.log('✅ Gemini API is working!')
  console.log('Response:', response.text())
}

testGemini()
```

Run with: `npx tsx scripts/test-gemini.ts`

## 11. Useful Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api/rest)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_best_practices)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)
- [Pricing](https://ai.google.dev/pricing)

## 12. Troubleshooting

### Issue: "API key not valid"
- ✅ Verify you copied the full API key
- ✅ Check `.env.local` has `GEMINI_API_KEY`
- ✅ Restart your dev server after adding the key

### Issue: "Rate limit exceeded"
- ✅ Wait before retrying (60 requests per minute)
- ✅ Implement exponential backoff
- ✅ Consider upgrading your plan

### Issue: "Model not found"
- ✅ Use 'gemini-pro' (not 'gemini-1.0-pro')
- ✅ Check you're using the latest SDK version

### Issue: JSON parsing errors
- ✅ Be more specific in your prompt about JSON format
- ✅ Add error handling for malformed responses
- ✅ Provide examples in your prompt

---

**Ready to build AI-powered features!** 🚀

Start with simple test generation, then expand to:
- Custom question generation
- Candidate response analysis
- Performance predictions
- Interview question suggestions
