import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb, type MeasurementRow, type ProjectRow } from '@/lib/db';
import { getDictionary, isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from '@/lib/i18n';
import { display } from '@/lib/units';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const user = getCurrentUser();
  if (!user) redirect('/login');

  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value ?? '';
  const t = getDictionary(isLocale(cookieLocale) ? cookieLocale : user.locale ?? DEFAULT_LOCALE);

  const db = getDb();
  const projects = db
    .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    .all(user.id) as ProjectRow[];
  const profiles = db
    .prepare('SELECT * FROM measurements WHERE user_id = ? ORDER BY updated_at DESC')
    .all(user.id) as MeasurementRow[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-4xl">{t.dashboard.title}</h1>
          <p className="mt-1 text-sm uppercase tracking-widest text-ink/50">
            {user.display_name} · {user.role === 'professional' ? t.auth.roleProfessional : t.auth.roleHobbyist}
          </p>
        </div>
        <Link href="/projects/new" className="btn-primary">
          + {t.dashboard.newProject}
        </Link>
      </div>

      <section>
        <h2 className="mb-4 text-2xl">{t.dashboard.projects}</h2>
        {projects.length === 0 ? (
          <div className="card text-center text-ink/60">{t.dashboard.empty}</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.id} href={`/projects/${p.id}/guide`} className="card group transition hover:border-gold/50">
                <div className="mb-3 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-ivory-deep">
                  {p.input_photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.input_photo_url}
                      alt={p.name}
                      className="h-full w-full object-cover grayscale transition group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="font-display text-5xl text-gold/40">✂</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl">{p.name}</h3>
                  <span
                    className={`rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      p.status === 'generated' ? 'bg-sage/20 text-sage' : 'bg-gold/15 text-gold'
                    }`}
                  >
                    {p.status === 'generated' ? t.dashboard.statusGenerated : t.dashboard.statusDraft}
                  </span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-ink/40">{t.dashboard.openGuide} →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl">{t.dashboard.measurementProfiles}</h2>
        {profiles.length === 0 ? (
          <div className="card text-center text-ink/60">{t.dashboard.noProfiles}</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((m) => (
              <div key={m.id} className="card">
                <h3 className="text-xl">{m.profile_name}</h3>
                <dl className="mt-3 space-y-1 text-sm text-ink/70">
                  <div className="flex justify-between">
                    <dt>{t.wizard.waist}</dt>
                    <dd className="font-medium">{display(m.waist_circ, m.unit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t.wizard.hip}</dt>
                    <dd className="font-medium">{display(m.hip_circ, m.unit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t.wizard.totalLength}</dt>
                    <dd className="font-medium">{display(m.total_length, m.unit)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
