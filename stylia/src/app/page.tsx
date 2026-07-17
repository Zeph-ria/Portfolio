import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/auth';

export default function LandingPage() {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value ?? '';
  const user = getCurrentUser();
  const t = getDictionary(isLocale(cookieLocale) ? cookieLocale : user?.locale ?? DEFAULT_LOCALE);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-gold">{t.landing.tagline}</p>
        <h1 className="max-w-3xl text-5xl leading-tight sm:text-7xl">{t.landing.heroTitle}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">{t.landing.heroSubtitle}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href={user ? '/projects/new' : '/register'} className="btn-primary">
            {t.landing.ctaStart}
          </Link>
          {!user && (
            <Link href="/login" className="btn-secondary">
              {t.landing.ctaLogin}
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-6 pb-20 sm:grid-cols-3">
        {(['draft', 'textile', 'export'] as const).map((key) => (
          <div key={key} className="card">
            <h3 className="text-2xl">{t.landing.features[key].title}</h3>
            <p className="mt-2 text-ink/70">{t.landing.features[key].body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
