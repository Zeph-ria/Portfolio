'use client';

import type { Unit } from '@/lib/units';

/**
 * Global cm / inch switch. The parent owns the state so it can convert
 * form values in place when the unit flips (1 in = 2.54 cm).
 */
export function UnitToggle({
  unit,
  onChange,
  label,
}: {
  unit: Unit;
  onChange: (next: Unit) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-xs uppercase tracking-widest text-ink/60">{label}</span>}
      <div className="relative flex rounded-full border border-ink/15 bg-white p-1" role="group" aria-label={label ?? 'unit'}>
        {(['cm', 'inch'] as Unit[]).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onChange(u)}
            aria-pressed={unit === u}
            className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider transition ${
              unit === u ? 'bg-gold text-white' : 'text-ink/50 hover:text-ink'
            }`}
          >
            {u === 'cm' ? 'cm' : 'in'}
          </button>
        ))}
      </div>
    </div>
  );
}
