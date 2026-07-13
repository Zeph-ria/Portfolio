import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb, type MeasurementRow, type ProjectRow } from '@/lib/db';
import { isLocale, DEFAULT_LOCALE, LOCALE_COOKIE } from '@/lib/i18n';
import { draftGarment, isGarmentSlug } from '@/lib/pattern/garments';
import { consultTextiles } from '@/lib/textiles/consultant';
import { canExportFullSize } from '@/lib/payments/stripe';
import { GuideClient } from '@/components/GuideClient';

export const dynamic = 'force-dynamic';

export default function GuidePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { paid?: string };
}) {
  const user = getCurrentUser();
  if (!user) redirect('/login');

  const db = getDb();
  const project = db
    .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    .get(Number(params.id), user.id) as ProjectRow | undefined;
  if (!project) notFound();
  if (!project.measurement_id) redirect('/projects/new');

  const measurement = db
    .prepare('SELECT * FROM measurements WHERE id = ?')
    .get(project.measurement_id) as MeasurementRow;

  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value ?? '';
  const locale = isLocale(cookieLocale) ? cookieLocale : user.locale ?? DEFAULT_LOCALE;

  const garment = isGarmentSlug(project.garment_type)
    ? project.garment_type
    : 'straight_skirt_base';
  const draft = draftGarment(garment, measurement);
  const consultant = consultTextiles(garment, locale);

  return (
    <GuideClient
      projectId={project.id}
      projectName={project.name}
      garment={garment}
      draft={draft}
      consultant={consultant}
      canExport={canExportFullSize(user, project)}
      defaultFormat={user.paper_format}
      justPaid={searchParams.paid === '1'}
    />
  );
}
