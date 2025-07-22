import { NextRequest, NextResponse } from 'next/server';
import { analyzeSvg } from '@motif/analysis';
import { z } from 'zod';

const AnalyzeRequestSchema = z.object({
  svgString: z.string().min(1).max(500000), // 500KB limit
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validation = AnalyzeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { svgString } = validation.data;
    
    // Analyze the SVG
    const result = await analyzeSvg(svgString);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze SVG' },
      { status: 500 }
    );
  }
}

// Use Node.js runtime for heavy SVG processing
export const runtime = 'nodejs'; 