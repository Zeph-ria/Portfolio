'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { UnitToggle } from './UnitToggle';
import { convert, type Unit } from '@/lib/units';
import { SIZE_CHART } from '@/lib/pattern/sizeChart';
import { GARMENT_SLUGS, type GarmentSlug } from '@/lib/pattern/garments';

type PhotoAnalysis = { garment: GarmentSlug; confidence: string; note: string };

type MeasurementProfile = {
  id: number;
  profile_name: string;
  unit: Unit;
  bust_circ: number;
  waist_circ: number;
  hip_circ: number;
  waist_to_hip_height: number;
  total_length: number;
  small_hip_circ: number | null;
  small_hip_height: number | null;
};

const FIELDS = [
  'bust_circ',
  'waist_circ',
  'hip_circ',
  'small_hip_circ',
  'waist_to_hip_height',
  'small_hip_height',
  'total_length',
] as const;
type Field = (typeof FIELDS)[number];
const OPTIONAL_FIELDS: Field[] = ['small_hip_circ', 'small_hip_height'];

// Size-chart defaults (FR 40) so the form is instantly explorable.
const DEFAULT_CM: Record<Field, number> = {
  bust_circ: 92,
  waist_circ: 70,
  hip_circ: 96,
  small_hip_circ: 85,
  waist_to_hip_height: 20,
  small_hip_height: 9.4,
  total_length: 60,
};

export function NewProjectWizard({ defaultUnit }: { defaultUnit: Unit }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [garment, setGarment] = useState<GarmentSlug>('straight_skirt_base');
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [profileId, setProfileId] = useState<'new' | number>('new');
  const [profileName, setProfileName] = useState('');
  const [sizePreset, setSizePreset] = useState<'custom' | number>('custom');
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const [values, setValues] = useState<Record<Field, string>>(() => {
    const init = {} as Record<Field, string>;
    for (const f of FIELDS) {
      init[f] = String(defaultUnit === 'cm' ? DEFAULT_CM[f] : convert(DEFAULT_CM[f], 'cm', 'inch'));
    }
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/measurements')
      .then((r) => (r.ok ? r.json() : []))
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

  // ---- Step 1: upload + AI garment detection -------------------------------
  const analyzePhoto = useCallback(
    async (dataUrl: string) => {
      setAnalyzing(true);
      setAnalysis(null);
      try {
        const res = await fetch('/api/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: dataUrl, locale }),
        });
        if (res.ok) {
          const body = await res.json();
          if (body.analysis) {
            setAnalysis(body.analysis);
            setGarment(body.analysis.garment);
          }
        }
      } catch {
        // detection is best-effort; manual selection always works
      } finally {
        setAnalyzing(false);
      }
    },
    [locale],
  );

  const readFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/') || file.size > 3_000_000) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result);
        setPhoto(dataUrl);
        void analyzePhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [analyzePhoto],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  // ---- Step 3: unit conversion ----------------------------------------------
  function toggleUnit(next: Unit) {
    if (next === unit) return;
    setValues((prev) => {
      const converted = {} as Record<Field, string>;
      for (const f of FIELDS) {
        const v = parseFloat(prev[f]);
        converted[f] = Number.isFinite(v) ? String(convert(v, unit, next)) : prev[f];
      }
      return converted;
    });
    setUnit(next);
  }

  function selectProfile(id: 'new' | number) {
    setProfileId(id);
    if (id === 'new') return;
    const p = profiles.find((x) => x.id === id);
    if (!p) return;
    // stored values are canonical cm — display in the active unit
    setValues(() => {
      const next = {} as Record<Field, string>;
      for (const f of FIELDS) {
        const v = p[f];
        next[f] = v == null ? '' : String(convert(v, 'cm', unit));
      }
      return next;
    });
  }

  /** Pre-fill the form from the standard French size chart (still editable). */
  function selectSizePreset(preset: 'custom' | number) {
    setSizePreset(preset);
    if (preset === 'custom') return;
    const entry = SIZE_CHART.find((s) => s.fr === preset);
    if (!entry) return;
    setValues((prev) => {
      const next = { ...prev };
      for (const f of FIELDS) {
        if (f === 'total_length') continue; // length is a style choice, not a body measure
        const cmValue = entry[f as keyof typeof entry];
        if (typeof cmValue === 'number') next[f] = String(convert(cmValue, 'cm', unit));
      }
      return next;
    });
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      let measurementId = profileId === 'new' ? null : profileId;
      if (profileId === 'new') {
        const res = await fetch('/api/measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_name: profileName || t.wizard.profileName.split('(')[0].trim(),
            unit,
            ...Object.fromEntries(FIELDS.map((f) => [f, parseFloat(values[f])])),
          }),
        });
        if (!res.ok) throw new Error('measurements');
        measurementId = (await res.json()).id;
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName || t.garments[garment].name,
          garment_type: garment,
          measurement_id: measurementId,
          input_photo_url: photo,
          textile_tags: [],
          locale,
        }),
      });
      if (!res.ok) throw new Error('project');
      const project = await res.json();
      router.push(`/projects/${project.id}/guide`);
    } catch {
      setError(t.errors.generic);
      setBusy(false);
    }
  }

  const stepLabels = [t.wizard.step1, t.wizard.step2, t.wizard.step3];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-4xl">{t.wizard.title}</h1>

      {/* Stepper */}
      <ol className="mb-10 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                step > i ? 'bg-gold text-white' : 'border border-ink/20 text-ink/40'
              }`}
            >
              {i + 1}
            </span>
            <span className={`hidden text-xs uppercase tracking-widest sm:block ${step > i ? 'text-ink' : 'text-ink/40'}`}>
              {label}
            </span>
            {i < 2 && <span className="h-px flex-1 bg-ink/10" />}
          </li>
        ))}
      </ol>

      {/* Step 1 — Image to sketch */}
      {step === 1 && (
        <section className="card">
          <h2 className="mb-4 text-2xl">{t.wizard.uploadTitle}</h2>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex min-h-56 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
              dragOver ? 'border-gold bg-gold/5' : 'border-ink/20'
            }`}
          >
            {photo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="upload preview"
                  className="max-h-64 rounded-lg object-contain grayscale contrast-125"
                />
                {analyzing && (
                  <p className="animate-pulse text-sm text-gold">{t.wizard.aiAnalyzing}</p>
                )}
                {analysis && (
                  <div className="rounded-xl border border-sage/40 bg-sage/10 px-4 py-2 text-sm text-ink/80">
                    <span className="mr-2 rounded-full bg-sage/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sage">
                      {t.wizard.aiDetected}
                    </span>
                    <strong>{t.garments[analysis.garment].name}</strong>
                    {analysis.note && <span className="text-ink/60"> — {analysis.note}</span>}
                  </div>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setPhoto(null);
                    setAnalysis(null);
                  }}
                >
                  {t.wizard.uploadReplace}
                </button>
              </>
            ) : (
              <>
                <p className="text-ink/60">{t.wizard.uploadHint}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
                    {t.wizard.uploadBrowse}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => cameraInput.current?.click()}>
                    {t.wizard.uploadCamera}
                  </button>
                </div>
              </>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <button className="btn-primary" onClick={() => setStep(2)}>
              {t.wizard.next}
            </button>
          </div>
        </section>
      )}

      {/* Step 2 — Garment selector */}
      {step === 2 && (
        <section className="card">
          <h2 className="mb-4 text-2xl">{t.wizard.step2}</h2>
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="garment">{t.wizard.garmentLabel}</label>
              <select
                id="garment"
                className="field-input"
                value={garment}
                onChange={(e) => setGarment(e.target.value as GarmentSlug)}
              >
                {GARMENT_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {t.garments[slug].name}
                  </option>
                ))}
              </select>
              {analysis && analysis.garment === garment && (
                <p className="mt-1 text-xs text-sage">
                  ✓ {t.wizard.aiDetected} ({analysis.confidence})
                </p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor="projectName">{t.wizard.projectName}</label>
              <input
                id="projectName"
                className="field-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t.garments[garment].name}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              {t.wizard.back}
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              {t.wizard.next}
            </button>
          </div>
        </section>
      )}

      {/* Step 3 — Dynamic measurement form */}
      {step === 3 && (
        <section className="card">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <h2 className="text-2xl">{t.wizard.step3}</h2>
            <UnitToggle unit={unit} onChange={toggleUnit} label={t.wizard.unitToggle} />
          </div>

          <div className="mb-5">
            <label className="field-label" htmlFor="profile">{t.wizard.profileLabel}</label>
            <select
              id="profile"
              className="field-input"
              value={profileId}
              onChange={(e) => selectProfile(e.target.value === 'new' ? 'new' : Number(e.target.value))}
            >
              <option value="new">{t.wizard.newProfile}</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.profile_name}
                </option>
              ))}
            </select>
          </div>

          {profileId === 'new' && (
            <div className="mb-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="profileName">{t.wizard.profileName}</label>
                <input
                  id="profileName"
                  className="field-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label" htmlFor="sizePreset">{t.wizard.sizePreset}</label>
                <select
                  id="sizePreset"
                  className="field-input"
                  value={sizePreset}
                  onChange={(e) =>
                    selectSizePreset(e.target.value === 'custom' ? 'custom' : Number(e.target.value))
                  }
                >
                  <option value="custom">{t.wizard.sizeCustom}</option>
                  {SIZE_CHART.map((s) => (
                    <option key={s.fr} value={s.fr}>
                      {s.fr}
                      {s.intl ? ` (${s.intl})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f}>
                <label className="field-label" htmlFor={f}>
                  {t.wizard[
                    (
                      {
                        bust_circ: 'bust',
                        waist_circ: 'waist',
                        hip_circ: 'hip',
                        small_hip_circ: 'smallHip',
                        waist_to_hip_height: 'waistToHip',
                        small_hip_height: 'smallHipHeight',
                        total_length: 'totalLength',
                      } as const
                    )[f]
                  ]}{' '}
                  <span className="text-gold">({unit === 'cm' ? 'cm' : 'in'})</span>
                </label>
                <input
                  id={f}
                  type="number"
                  inputMode="decimal"
                  step={unit === 'cm' ? 0.1 : 0.01}
                  min={0}
                  className="field-input"
                  value={values[f]}
                  disabled={profileId !== 'new'}
                  onChange={(e) => setValues((prev) => ({ ...prev, [f]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              {t.wizard.back}
            </button>
            <button className="btn-primary" onClick={generate} disabled={busy}>
              {busy ? t.wizard.generating : t.wizard.generate}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
