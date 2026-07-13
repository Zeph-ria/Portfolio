/**
 * Garment registry — the single place where a garment type plugs into the
 * app: drafting engine, guide steps (mapped to line ids and live values),
 * and textile drape preference. Adding a garment here automatically adds it
 * to the wizard dropdown, the guide, the AI photo classifier and the
 * textile consultant.
 */

import type { PatternDraft } from './types';
import { draftStraightSkirt, type BodyMeasurementsCm } from './skirtBlock';
import { draftFlaredSkirt } from './flaredSkirt';
import { draftBodiceBlock } from './bodiceBlock';
import { draftStraightTrousers } from './trousersBlock';

export type GarmentSlug =
  | 'straight_skirt_base'
  | 'flared_skirt'
  | 'bodice_block'
  | 'straight_trousers';

export interface GuideStep {
  /** i18n key under t.garments[slug].steps */
  key: string;
  /** pattern line ids revealed by this step */
  lineIds: string[];
  /** live numeric annotation built from draft.computed */
  value?: (c: Record<string, number>) => string;
}

export interface GarmentDefinition {
  slug: GarmentSlug;
  /** which drape family suits this garment (drives the textile consultant) */
  drape: 'rigid' | 'fluid' | 'any';
  draft: (m: BodyMeasurementsCm) => PatternDraft;
  steps: GuideStep[];
}

export const GARMENTS: Record<GarmentSlug, GarmentDefinition> = {
  straight_skirt_base: {
    slug: 'straight_skirt_base',
    drape: 'rigid',
    draft: draftStraightSkirt,
    steps: [
      {
        key: 'frame',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `${c.totalWidth} cm`,
      },
      {
        key: 'hipLine',
        lineIds: ['hip-line', 'small-hip-line'],
        value: (c) => `y = ${c.hipLineY} | ${c.smallHipLineY} cm`,
      },
      {
        key: 'sideSeam',
        lineIds: ['side-seam-axis'],
        value: (c) => `${c.backPanelWidth} | ${c.frontPanelWidth} cm`,
      },
      {
        key: 'darts',
        lineIds: ['back-dart-legs', 'back-dart-axis', 'front-dart-legs', 'front-dart-axis'],
        value: (c) => `Σ ${c.totalWaistReduction} → ${c.backDartValue} / ${c.frontDartValue} cm`,
      },
      {
        key: 'curves',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `2 × ${c.sideCurveEach} cm`,
      },
      { key: 'finish', lineIds: [] },
    ],
  },

  flared_skirt: {
    slug: 'flared_skirt',
    drape: 'fluid',
    draft: draftFlaredSkirt,
    steps: [
      {
        key: 'frame',
        lineIds: ['hip-line', 'side-seam-axis'],
        value: (c) => `${c.totalWidth} cm`,
      },
      {
        key: 'pivot',
        lineIds: ['back-pivot-ray', 'front-pivot-ray'],
        value: (c) => `Σ ${c.totalWaistReduction} cm`,
      },
      {
        key: 'flare',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `+${c.backHemFlare} / +${c.frontHemFlare} cm`,
      },
      {
        key: 'hem',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `${c.hemWidthTotal} cm`,
      },
      { key: 'finish', lineIds: [] },
    ],
  },

  bodice_block: {
    slug: 'bodice_block',
    drape: 'any',
    draft: draftBodiceBlock,
    steps: [
      {
        key: 'frame',
        lineIds: ['bust-line', 'scye-line'],
        value: (c) => `${c.totalWidth} × ${c.backLength} cm`,
      },
      {
        key: 'necklines',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `${c.neckWidth} cm`,
      },
      {
        key: 'shoulders',
        lineIds: ['back-outline', 'front-outline'],
        value: (c) => `${c.shoulderLength} cm`,
      },
      {
        key: 'armhole',
        lineIds: ['side-seam-axis'],
        value: (c) => `y = ${c.scyeLineY} cm`,
      },
      {
        key: 'darts',
        lineIds: ['back-dart-legs', 'back-dart-axis', 'front-dart-legs', 'front-dart-axis'],
        value: (c) => `${c.backDartValue} / ${c.frontDartValue} cm`,
      },
      { key: 'finish', lineIds: [] },
    ],
  },

  straight_trousers: {
    slug: 'straight_trousers',
    drape: 'rigid',
    draft: draftStraightTrousers,
    steps: [
      {
        key: 'frame',
        lineIds: ['hip-line', 'crotch-line', 'knee-line'],
        value: (c) => `montant ${c.crotchDepth} cm`,
      },
      {
        key: 'forks',
        lineIds: ['front-outline', 'back-outline'],
        value: (c) => `${c.frontFork} / ${c.backFork} cm`,
      },
      {
        key: 'creases',
        lineIds: ['front-crease', 'back-crease'],
      },
      {
        key: 'legs',
        lineIds: ['front-outline', 'back-outline'],
        value: (c) => `${c.hemWidth} cm`,
      },
      {
        key: 'darts',
        lineIds: ['front-dart-legs', 'front-dart-axis', 'back-dart-legs', 'back-dart-axis'],
      },
      { key: 'finish', lineIds: [] },
    ],
  },
};

export const GARMENT_SLUGS = Object.keys(GARMENTS) as GarmentSlug[];

export function isGarmentSlug(v: string): v is GarmentSlug {
  return v in GARMENTS;
}

/** Draft any registered garment; falls back to the straight skirt. */
export function draftGarment(slug: string, m: BodyMeasurementsCm): PatternDraft {
  const def = isGarmentSlug(slug) ? GARMENTS[slug] : GARMENTS.straight_skirt_base;
  return def.draft(m);
}
