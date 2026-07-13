'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';
import { UnitToggle } from './UnitToggle';
import { convert, type Unit } from '@/lib/units';

type MeasurementProfile = {
  id: number;
  profile_name: string;
  unit: Unit;
  bust_circ: number;
  waist_circ: number;
  hip_circ: number;
  waist_to_hip_height: number;
  total_length: number;
};

const FIELDS = ['bust_circ', 'waist_circ', 'hip_circ', 'waist_to_hip_height', 'total_length'] as const;
type Field = (typeof FIELDS)[number];

// Sensible cm defaults (size 38/40) so the form is instantly explorable.
const DEFAULT_CM: Record<Field, number> = {
  bust_circ: 90,
  waist_circ: 70,
  hip_circ: 96,
  waist_to_hip_height: 20,
  total_length: 60,
};

export function NewProjectWizard({ defaultUnit }: { defaultUnit: Unit }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [garment, setGarment] = useState('straight_skirt_base');
  const [projectName, setProjectName] = useState('');
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [profileId, setProfileId] = useState<'new' | number>('new');
  const [profileName, setProfileName] = useState('');
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

  // ---- Step 1: upload ------------------------------------------------------
  const readFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/') || file.size > 3_000_000) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }, []);

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
      for (const f of FIELDS) next[f] = String(convert(p[f], 'cm', unit));
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
          name: projectName || t.wizard.straightSkirt.split('/')[0].trim(),
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
                {/* sketch-style preview — the image-to-sketch AI hook plugs in here */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt="upload preview"
                  className="max-h-64 rounded-lg object-contain grayscale contrast-125"
                />
                <button type="button" className="btn-secondary" onClick={() => setPhoto(null)}>
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
                onChange={(e) => setGarment(e.target.value)}
              >
                <option value="straight_skirt_base">{t.wizard.straightSkirt}</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="projectName">{t.wizard.projectName}</label>
              <input
                id="projectName"
                className="field-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder={t.wizard.straightSkirt.split('/')[0].trim()}
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
            <div className="mb-5">
              <label className="field-label" htmlFor="profileName">{t.wizard.profileName}</label>
              <input
                id="profileName"
                className="field-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
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
                        waist_to_hip_height: 'waistToHip',
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
