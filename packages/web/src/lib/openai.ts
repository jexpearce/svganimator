import OpenAI from 'openai';
import {
  SuggestionResponseSchema,
  type SvgMetadata,
  type SuggestionResponse,
} from '@motif/schema';

// Initialize OpenAI client (will use OPENAI_API_KEY env var)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function suggestAnimation(
  svgMeta: SvgMetadata,
  prompt: string
): Promise<SuggestionResponse> {
  const systemPrompt = `You are Motif AI assistant, an expert at suggesting SVG animations.

User prompt: "${prompt}"
SVG metadata:
- Stroke-based: ${svgMeta.isStrokeBased}
- Structured (has groups): ${svgMeta.isStructured}
- Has path elements: ${svgMeta.hasPaths}
- Total elements: ${svgMeta.elementCount}

AVAILABLE ANIMATIONS:
1. fadeIn - Fades element from transparent to opaque
2. scale - Scales element from one size to another
3. slideIn - Slides element in from a direction
4. drawPath - Animates stroke-based SVGs as if being drawn (ONLY if isStrokeBased=true)
5. staggerFadeIn - Fades in child elements with stagger (ONLY if isStructured=true)

RULES:
- Choose animations that match the user's intent
- Prefer drawPath for stroke-based SVGs when user mentions "draw", "trace", "write"
- Prefer staggerFadeIn for structured SVGs when user mentions "cascade", "sequence", "stagger"
- For generic requests ("animate", "make it move"), choose based on SVG type
- Always provide reasonable default durations (300-2000ms)
- Return 1-3 suggestions, ordered by relevance`;

  const response = await openai.chat.completions.create({
    model: process.env.MOTIF_OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    tools: [{
      type: 'function',
      function: {
        name: 'suggest_animation',
        description: 'Suggest animation primitives based on user prompt and SVG metadata',
        parameters: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['fadeIn', 'scale', 'slideIn', 'drawPath', 'staggerFadeIn'],
                  },
                  options: {
                    type: 'object',
                    description: 'Animation options specific to the type',
                  },
                },
                required: ['type', 'options'],
              },
              minItems: 1,
              maxItems: 3,
            },
          },
          required: ['suggestions'],
        },
      },
    }],
    tool_choice: { type: 'function', function: { name: 'suggest_animation' } },
    temperature: 0.7,
    max_tokens: 500,
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall?.function?.arguments) {
    throw new Error('No animation suggestions returned');
  }

  return SuggestionResponseSchema.parse(
    JSON.parse(toolCall.function.arguments)
  );
} 