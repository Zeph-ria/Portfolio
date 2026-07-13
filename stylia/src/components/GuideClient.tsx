'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PatternDraft } from '@/lib/pattern/types';
import { GARMENTS, type GarmentSlug } from '@/lib/pattern/garments';
import type { ConsultantPayload } from '@/lib/textiles/consultant';
import type { PaperFormat } from '@/lib/export/pdf';
import { PatternCanvas } from './PatternCanvas';
import { useI18n } from './I18nProvider';

export function GuideClient({
  projectId,
  projectName,
  garment,
  draft,
  consultant,
  canExport,
  defaultFormat,
  justPaid,
}: {
  projectId: number;
  projectName: string;
  garment: GarmentSlug;
  draft: PatternDraft;
  consultant: ConsultantPayload;
  canExport: boolean;
  defaultFormat: PaperFormat;
  justPaid: boolean;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [format, setFormat] = useState<PaperFormat>(defaultFormat);
  const [busy, setBusy] = useState(false);

  const steps = GARMENTS[garment].steps;
  const stepTexts = t.garments[garment].steps as Record<string, { title: string; body: string }>;

  const visibleLineIds = useMemo(() => {
    const ids = new Set<string>();
    for (let i = 0; i <= activeStep && i < steps.length; i++) {
      for (const id of steps[i].lineIds) ids.add(id);
    }
    // the last step reveals the complete pattern
    if (activeStep === steps.length - 1) draft.lines.forEach((l) => ids.add(l.id));
    return [...ids];
  }, [activeStep, draft, steps]);

  const activeLineIds = steps[activeStep]?.lineIds ?? [];

  async function exportPdf() {
    if (!canExport) {
      setBusy(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId }),
      });
      setBusy(false);
      if (res.ok) {
        const session = await res.json();
        router.push(session.url);
      }
      return;
    }
    window.open(`/api/projects/${projectId}/export?format=${format}`, '_blank');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <h1 className="text-3xl sm:text-4xl">{projectName}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-ink/60" htmlFor="paper">
            {t.guide.paperFormat}
          </label>
          <select
            id="paper"
            className="field-input !w-auto"
            value={format}
            onChange={(e) => setFormat(e.target.value as PaperFormat)}
          >
            <option value="A4">A4</option>
            <option value="USLetter">US Letter</option>
            <option value="A0">A0</option>
            <option value="FullSize">{t.guide.fullSize}</option>
          </select>
          <button className="btn-primary" onClick={exportPdf} disabled={busy}>
            {canExport ? t.guide.exportPdf : t.guide.unlock}
          </button>
          <a
            className="btn-secondary"
            href={`https://www.google.com/search?q=${encodeURIComponent(
              `${consultant.recommended[0]?.name ?? 'denim'} fabric buy`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.guide.buyFabric}
          </a>
        </div>
      </div>

      {justPaid && (
        <div className="mb-6 rounded-xl border border-sage/40 bg-sage/10 px-5 py-3 text-sage">
          {t.guide.paymentSuccess}
        </div>
      )}

      {!canExport && (
        <div className="mb-6 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm text-ink/80">
          <strong className="mr-2">{t.guide.lockedTitle}.</strong>
          {t.guide.lockedBody}
        </div>
      )}

      {/* Split screen: instructions left, live canvas right */}
      <div className="grid gap-6 lg:grid-cols-[minmax(320px,2fr)_3fr]">
        <section aria-label={t.guide.stepsTitle} className="space-y-3">
          <h2 className="text-2xl">
            {t.guide.stepsTitle} — {t.garments[garment].name}
          </h2>
          {steps.map((step, i) => (
            <button
              key={step.key}
              onClick={() => setActiveStep(i)}
              className={`block w-full rounded-2xl border p-5 text-left transition ${
                i === activeStep
                  ? 'border-gold bg-gold/5 shadow-couture'
                  : i < activeStep
                    ? 'border-ink/10 bg-white/60'
                    : 'border-ink/10 bg-white/30 opacity-60'
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-medium">
                  <span className="mr-2 font-display text-gold">{i + 1}.</span>
                  {stepTexts[step.key]?.title}
                </h3>
                {step.value && (
                  <span className="whitespace-nowrap font-mono text-[11px] text-ink/50">
                    {step.value(draft.computed)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink/70">{stepTexts[step.key]?.body}</p>
            </button>
          ))}
        </section>

        <section aria-label={t.guide.canvasTitle} className="min-h-[420px] lg:sticky lg:top-20 lg:h-[calc(100vh-9rem)]">
          <PatternCanvas
            draft={draft}
            visibleLineIds={visibleLineIds}
            activeLineIds={activeLineIds}
            watermark={canExport ? null : 'STYLIA · DRAFT'}
          />
        </section>
      </div>

      {/* Textile consultant */}
      <section className="mt-12">
        <h2 className="mb-4 text-2xl">{t.textiles.title}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-3 text-lg text-sage">{t.textiles.recommended}</h3>
            <ul className="space-y-3">
              {consultant.recommended.map((f) => (
                <li key={f.slug} className="rounded-xl bg-ivory-deep/60 p-4">
                  <div className="flex items-center justify-between">
                    <strong>{f.name}</strong>
                    <span className="text-xs text-ink/50">
                      {t.textiles.ironTemp}: {f.iron_temp_c}°C · {t.textiles.shrinkage}: {f.wash_shrinkage_pct}%
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/70">{f.tips}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="mb-3 text-lg text-gold">{t.textiles.warnings}</h3>
            <ul className="space-y-3">
              {consultant.warnings.map((f) => (
                <li key={f.slug} className="rounded-xl bg-gold/5 p-4">
                  <div className="flex items-center justify-between">
                    <strong>{f.name}</strong>
                    <span className="text-xs text-ink/50">
                      {t.textiles.ironTemp}: {f.iron_temp_c}°C
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/70">{t.textiles.stabilizeWarning}</p>
                  <p className="mt-1 text-sm text-ink/60">{f.tips}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
