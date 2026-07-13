import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { aiAvailable, analyzeGarmentPhoto } from '@/lib/ai/analyzePhoto';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Classifies an uploaded fashion photo into a draftable garment type.
 * POST { photo: <data URL>, locale }
 * → { available, analysis: { garment, confidence, note } | null }
 */
export async function POST(req: Request) {
  try {
    requireUser();
    if (!aiAvailable()) {
      return NextResponse.json({ available: false, analysis: null });
    }

    const body = await req.json();
    const photo = typeof body.photo === 'string' ? body.photo : '';
    const locale = isLocale(String(body.locale ?? '')) ? body.locale : DEFAULT_LOCALE;
    if (!photo.startsWith('data:image/') || photo.length > 4_500_000) {
      return NextResponse.json({ error: 'Invalid photo' }, { status: 400 });
    }

    const analysis = await analyzeGarmentPhoto(photo, locale);
    return NextResponse.json({ available: true, analysis });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
