'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, locale }),
    });
    setBusy(false);
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(
        body.code === 'exists' ? t.auth.errorExists : t.auth.errorInvalid,
      );
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-0">
      <div className="card">
        <h1 className="mb-6 text-3xl">{mode === 'login' ? t.auth.signIn : t.auth.signUp}</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="field-label" htmlFor="displayName">{t.auth.displayName}</label>
              <input id="displayName" name="displayName" required className="field-input" />
            </div>
          )}
          <div>
            <label className="field-label" htmlFor="email">{t.auth.email}</label>
            <input id="email" name="email" type="email" required className="field-input" autoComplete="email" />
          </div>
          <div>
            <label className="field-label" htmlFor="password">{t.auth.password}</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="field-input"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {mode === 'register' && (
            <div>
              <span className="field-label">{t.auth.role}</span>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-3 has-[:checked]:border-gold has-[:checked]:ring-2 has-[:checked]:ring-gold/20">
                  <input type="radio" name="role" value="hobbyist" defaultChecked className="accent-gold" />
                  <span className="text-sm">{t.auth.roleHobbyist}</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-3 has-[:checked]:border-gold has-[:checked]:ring-2 has-[:checked]:ring-gold/20">
                  <input type="radio" name="role" value="professional" className="accent-gold" />
                  <span className="text-sm">{t.auth.roleProfessional}</span>
                </label>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {mode === 'login' ? t.auth.signIn : t.auth.signUp}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-ink/60">
          {mode === 'login' ? (
            <>
              {t.auth.noAccount}{' '}
              <Link href="/register" className="text-gold underline-offset-2 hover:underline">
                {t.nav.register}
              </Link>
            </>
          ) : (
            <>
              {t.auth.haveAccount}{' '}
              <Link href="/login" className="text-gold underline-offset-2 hover:underline">
                {t.nav.login}
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
