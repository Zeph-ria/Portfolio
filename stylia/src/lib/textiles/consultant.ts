import { getDb, type TextileRow, type Locale } from '../db';

/**
 * Intelligent Textile Consultant.
 *
 * Given a garment type, analyses the textile knowledge base and returns a
 * structured recommendation payload: structured/rigid fabrics suit a basic
 * straight skirt; highly fluid fabrics (viscose, silk…) trigger a
 * stabilisation warning (tissue-paper backing during cutting), and every
 * fabric ships with exact thermal (iron) instructions.
 */

export interface TextileAdvice {
  slug: string;
  name: string;
  drape_type: 'fluid' | 'rigid';
  wash_shrinkage_pct: number;
  iron_temp_c: number;
  tips: string;
  stabilization_required: boolean;
}

export interface ConsultantPayload {
  garment_type: string;
  locale: Locale;
  recommended: TextileAdvice[];
  warnings: TextileAdvice[];
  thermal_instructions: Record<string, { iron_temp_c: number; note: string }>;
}

const THERMAL_NOTE: Record<Locale, (t: TextileRow) => string> = {
  fr: (t) => `Repassez « ${t.name_fr} » à ${t.iron_temp}°C maximum. ${t.tips_fr}`,
  en: (t) => `Iron "${t.name_en}" at ${t.iron_temp}°C maximum. ${t.tips_en}`,
  es: (t) => `Planche «${t.name_es}» a ${t.iron_temp}°C como máximo. ${t.tips_es}`,
};

function toAdvice(t: TextileRow, locale: Locale): TextileAdvice {
  const name = locale === 'fr' ? t.name_fr : locale === 'es' ? t.name_es : t.name_en;
  const tips = locale === 'fr' ? t.tips_fr : locale === 'es' ? t.tips_es : t.tips_en;
  return {
    slug: t.slug,
    name,
    drape_type: t.drape_type,
    wash_shrinkage_pct: t.wash_shrinkage,
    iron_temp_c: t.iron_temp,
    tips,
    stabilization_required: t.drape_type === 'fluid',
  };
}

export function consultTextiles(garmentType: string, locale: Locale): ConsultantPayload {
  const db = getDb();
  const textiles = db.prepare('SELECT * FROM textiles ORDER BY name_en').all() as TextileRow[];

  // For the straight-skirt MVP: structured/rigid fabrics hold the silhouette;
  // fluid fabrics are flagged. Future garment types plug in their own filters.
  const isStraightSkirt = garmentType === 'straight_skirt_base';
  const recommended = textiles.filter((t) => (isStraightSkirt ? t.drape_type === 'rigid' : true));
  const warnings = textiles.filter((t) => t.drape_type === 'fluid');

  const thermal: ConsultantPayload['thermal_instructions'] = {};
  for (const t of textiles) {
    thermal[t.slug] = { iron_temp_c: t.iron_temp, note: THERMAL_NOTE[locale](t) };
  }

  return {
    garment_type: garmentType,
    locale,
    recommended: recommended.map((t) => toAdvice(t, locale)),
    warnings: warnings.map((t) => toAdvice(t, locale)),
    thermal_instructions: thermal,
  };
}
