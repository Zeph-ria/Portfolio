import Anthropic from '@anthropic-ai/sdk';
import { GARMENT_SLUGS, type GarmentSlug } from '../pattern/garments';

/**
 * Image-to-Sketch intelligence: classifies an uploaded fashion photo into
 * one of the draftable garment types so the wizard can pre-select it.
 *
 * Requires ANTHROPIC_API_KEY in the environment. Without it the feature
 * degrades gracefully (the wizard falls back to manual selection).
 */

export interface PhotoAnalysis {
  garment: GarmentSlug;
  confidence: 'high' | 'medium' | 'low';
  /** short styling note in the user's language */
  note: string;
}

const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

export function aiAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Parses a data URL into base64 payload + media type, or null. */
function parseDataUrl(dataUrl: string): { data: string; mediaType: MediaType } | null {
  const match = /^data:(image\/[a-z+]+);base64,(.+)$/s.exec(dataUrl);
  if (!match) return null;
  const mediaType = match[1] as MediaType;
  if (!MEDIA_TYPES.includes(mediaType)) return null;
  return { data: match[2], mediaType };
}

export async function analyzeGarmentPhoto(
  photoDataUrl: string,
  locale: string,
): Promise<PhotoAnalysis | null> {
  if (!aiAvailable()) return null;
  const image = parseDataUrl(photoDataUrl);
  if (!image) return null;

  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system:
      'You are a pattern-drafting assistant for a fashion SaaS. ' +
      'Classify the garment shown in the photo into exactly one of the draftable ' +
      `types: ${GARMENT_SLUGS.join(', ')}. Choose the closest match ` +
      '(e.g. any dress or top → bodice_block, any trousers/jeans → straight_trousers, ' +
      'a-line/circle skirts → flared_skirt, pencil/straight skirts → straight_skirt_base). ' +
      `Write the note in this language: ${locale}.`,
    output_config: {
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            garment: { type: 'string', enum: [...GARMENT_SLUGS] },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            note: { type: 'string' },
          },
          required: ['garment', 'confidence', 'note'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: image.mediaType, data: image.data },
          },
          {
            type: 'text',
            text: 'Which draftable garment type does this photo show?',
          },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') return null;
  const text = response.content.find((b) => b.type === 'text');
  if (!text || text.type !== 'text') return null;

  try {
    const parsed = JSON.parse(text.text) as PhotoAnalysis;
    return GARMENT_SLUGS.includes(parsed.garment) ? parsed : null;
  } catch {
    return null;
  }
}
