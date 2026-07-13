import { NextResponse } from 'next/server';
import { consultTextiles } from '@/lib/textiles/consultant';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/**
 * Intelligent Textile Consultant endpoint.
 * GET /api/textiles?garment=straight_skirt_base&locale=fr
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const garment = url.searchParams.get('garment') ?? 'straight_skirt_base';
  const rawLocale = url.searchParams.get('locale') ?? DEFAULT_LOCALE;
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  return NextResponse.json(consultTextiles(garment, locale));
}
