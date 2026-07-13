import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import './globals.css';
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE, type Locale } from '@/lib/i18n';
import { getCurrentUser } from '@/lib/auth';
import { I18nProvider } from '@/components/I18nProvider';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const metadata: Metadata = {
  title: 'StylIA — Fashion drafting, to the millimetre',
  description:
    'Automated fashion design and parametric pattern drafting. From photo to print-ready sewing pattern.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value ?? '';
  const user = getCurrentUser();
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : (user?.locale ?? DEFAULT_LOCALE);
  const t = getDictionary(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <I18nProvider locale={locale} dictionary={t}>
          <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
              <Link href="/" className="font-display text-2xl tracking-wide">
                Styl<span className="text-gold">IA</span>
              </Link>
              <nav className="flex items-center gap-3 sm:gap-5">
                {user ? (
                  <>
                    <Link href="/dashboard" className="hidden text-sm uppercase tracking-widest text-ink/70 hover:text-ink sm:block">
                      {t.nav.dashboard}
                    </Link>
                    <Link href="/projects/new" className="hidden text-sm uppercase tracking-widest text-ink/70 hover:text-ink sm:block">
                      {t.nav.newProject}
                    </Link>
                    <form action="/api/auth/logout" method="post">
                      <button className="text-sm uppercase tracking-widest text-ink/70 hover:text-ink">
                        {t.nav.logout}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm uppercase tracking-widest text-ink/70 hover:text-ink">
                      {t.nav.login}
                    </Link>
                    <Link href="/register" className="hidden text-sm uppercase tracking-widest text-ink/70 hover:text-ink sm:block">
                      {t.nav.register}
                    </Link>
                  </>
                )}
                <LanguageSwitcher />
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t border-ink/10 py-8 text-center text-xs uppercase tracking-widest text-ink/40">
            StylIA © {new Date().getFullYear()} — {t.landing.tagline}
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
