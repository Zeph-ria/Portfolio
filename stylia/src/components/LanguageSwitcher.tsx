'use client';

import { useRouter } from 'next/navigation';
import { LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { useI18n } from './I18nProvider';

const LABELS: Record<Locale, string> = { fr: 'FR', en: 'EN', es: 'ES' };

export function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();

  function setLocale(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${86400 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-ink/15 p-1" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          aria-pressed={l === locale}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider transition ${
            l === locale ? 'bg-ink text-ivory' : 'text-ink/50 hover:text-ink'
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
