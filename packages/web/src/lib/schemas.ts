import { z } from 'zod';

// Primitive types enum
export const primitiveEnum = z.enum(['fadeIn', 'scale', 'slideIn', 'drawPath', 'staggerFadeIn']);

// Base timing schema
const timingSchema = z.object({
  duration: z.number().int().positive().describe('Animation duration in milliseconds'),
  easing: z.string().optional().default('ease').describe('CSS easing function'),
  delay: z.number().int().min(0).optional().default(0).describe('Delay before animation starts'),
  fill: z.enum(['none', 'forwards', 'both']).optional().default('forwards'),
});

// Individual primitive argument schemas
const fadeInSchema = z.object({
  type: z.literal('fadeIn'),
  options: timingSchema.extend({
    from: z.number().min(0).max(1).optional().default(0),
    to: z.number().min(0).max(1).optional().default(1),
    selector: z.string().optional(),
  }),
});

const scaleSchema = z.object({
  type: z.literal('scale'),
  options: timingSchema.extend({
    from: z.number().min(0).default(0.5),
    to: z.number().min(0).default(1),
    origin: z.string().optional().default('center'),
    selector: z.string().optional(),
  }),
});

const slideInSchema = z.object({
  type: z.literal('slideIn'),
  options: timingSchema.extend({
    fromDirection: z.enum(['left', 'right', 'top', 'bottom']),
    distance: z.string().regex(/^\d+px$/).default('100px'),
    selector: z.string().optional(),
  }),
});

const drawPathSchema = z.object({
  type: z.literal('drawPath'),
  options: timingSchema.extend({
    stagger: z.number().int().min(0).optional().default(0),
    selector: z.string().optional(),
  }),
});

const staggerFadeInSchema = z.object({
  type: z.literal('staggerFadeIn'),
  options: timingSchema.extend({
    childSelector: z.string(),
    stagger: z.number().int().positive(),
  }),
});

// Discriminated union for all primitive arguments
export const PrimitiveArgumentSchema = z.discriminatedUnion('type', [
  fadeInSchema,
  scaleSchema,
  slideInSchema,
  drawPathSchema,
  staggerFadeInSchema,
]);

export type PrimitiveArgument = z.infer<typeof PrimitiveArgumentSchema>;

// SVG metadata schema for OpenAI context
export const SvgMetadataSchema = z.object({
  isStrokeBased: z.boolean(),
  isStructured: z.boolean(),
  hasGroups: z.boolean(),
  elementCount: z.number(),
  hasPaths: z.boolean(),
});

export type SvgMetadata = z.infer<typeof SvgMetadataSchema>;

// Schema for API responses
export const SuggestionResponseSchema = z.object({
  suggestions: z.array(PrimitiveArgumentSchema).min(1).max(3),
  reasoning: z.string().optional(),
});

// Schema for prompt request
export const SuggestionRequestSchema = z.object({
  svgMeta: SvgMetadataSchema,
  prompt: z.string().min(1).max(500),
});

// Helper to create OpenAI function schema
export function createOpenAIFunctionSchema() {
  return {
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
                description: 'The animation primitive type',
              },
              options: {
                type: 'object',
                description: 'Options specific to the animation type',
              },
              reasoning: {
                type: 'string',
                description: 'Brief explanation of why this animation was chosen',
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
  };
} 