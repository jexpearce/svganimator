import { NextRequest, NextResponse } from 'next/server';
import { suggestAnimation } from '@/lib/openai';
import { SuggestionRequestSchema, PrimitiveArgumentSchema } from '@/lib/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validation = SuggestionRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { svgMeta, prompt } = validation.data;
    
    // Call OpenAI
    const result = await suggestAnimation(svgMeta, prompt);
    
    // Validate suggestions
    const validatedSuggestions = [];
    for (const suggestion of result.suggestions) {
      const validated = PrimitiveArgumentSchema.safeParse(suggestion);
      if (validated.success) {
        validatedSuggestions.push(validated.data);
      }
    }
    
    if (validatedSuggestions.length === 0) {
      throw new Error('No valid suggestions generated');
    }
    
    return NextResponse.json({
      suggestions: validatedSuggestions,
    });
  } catch (error) {
    console.error('Suggestion API error:', error);
    
    // Return fallback suggestions on error
    return NextResponse.json({
      suggestions: [
        { type: 'fadeIn', options: { duration: 1000 } },
        { type: 'scale', options: { duration: 800, from: 0.5, to: 1 } },
      ],
    });
  }
}

// Use Node.js runtime for OpenAI SDK
export const runtime = 'nodejs'; 