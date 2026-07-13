import en, { type Dictionary } from './en';
import fr from './fr';
import es from './es';

export type Locale = 'fr' | 'en' | 'es';
export type { Dictionary };

export const LOCALES: Locale[] = ['fr', 'en', 'es'];
export const DEFAULT_LOCALE: Locale = 'fr';
export const LOCALE_COOKIE = 'stylia_locale';

const dictionaries: Record<Locale, Dictionary> = { en, fr, es };

export function getDictionary(locale: string | undefined): Dictionary {
  return dictionaries[(locale as Locale) ?? DEFAULT_LOCALE] ?? dictionaries[DEFAULT_LOCALE];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}
