/**
 * intents.ts — registry of intent workflow pages (Phase 2).
 *
 * The intents orchestrator REGISTERS every page it creates here; the sidebar
 * section (IntentsNav) renders automatically from this list — no Layout edit
 * needed. Keep `path` identical to the route added in App.tsx's
 * `<custom:routes>` block.
 *
 * ONLY write inside the marker blocks — everything outside is scaffold and is
 * overwritten on the next /build/update.
 *
 *   <custom:intent-imports>
 *   import { IconCalendarPlus } from '@tabler/icons-react';
 *   </custom:intent-imports>
 *   …
 *   <custom:intents>
 *   { path: '/intents/neue-buchung', label: { de: 'Neue Buchung', en: 'New booking' }, icon: IconCalendarPlus, description: { de: 'Buchung in 3 Schritten anlegen', en: 'Create a booking in 3 steps' } },
 *   </custom:intents>
 */
import type { ComponentType } from 'react';

// <custom:intent-imports>
import { IconRocket, IconFlagCheck, IconBulb, IconGavel, IconChecklist, IconNotebook, IconArrowsExchange, IconRuler } from '@tabler/icons-react';
// </custom:intent-imports>

export interface IntentLink {
  /** Route path as wired in App.tsx (HashRouter), e.g. '/intents/neue-buchung'. */
  path: string;
  /**
   * Short sidebar label (1–3 words). Preferred: both UI languages
   * ({ de, en } — the runtime switcher picks the active one; cs stays
   * readable for legacy entries). A plain string stays valid and renders as-is.
   */
  label: string | { de?: string; en?: string; cs?: string };
  /** Tabler icon COMPONENT reference (not rendered JSX), e.g. IconCalendarPlus. */
  icon?: ComponentType<{ size?: number | string; className?: string; stroke?: number | string }>;
  /**
   * One-line purpose. Same shape as `label`: prefer both UI languages so a
   * language switch reaches it; a plain string stays valid.
   */
  description?: string | { de?: string; en?: string; cs?: string };
}

export const INTENTS: IntentLink[] = [
  // <custom:intents>
  { path: '/intents/vorhaben-anlegen', label: { de: 'Vorhaben anlegen', en: 'Create undertaking' }, icon: IconRocket, description: 'Ein neues Vorhaben mit Arbeitsbereich, Sichtbarkeit, Titel, Anlass und Verantwortung anlegen.' },
  { path: '/intents/vorhaben-beenden', label: { de: 'Vorhaben beenden', en: 'Close undertaking' }, icon: IconFlagCheck, description: 'Ein Vorhaben mit Ergebnis und Abschlussgrund beenden.' },
  { path: '/intents/erkenntnisse-erfassen', label: { de: 'Erkenntnisse erfassen', en: 'Record findings' }, icon: IconBulb, description: 'Mehrere Beiträge, Quellen, Annahmen, Fallfragen oder Einwände zu einem Vorhaben erfassen.' },
  { path: '/intents/entscheidung-festhalten', label: { de: 'Entscheidung oder Freigabe festhalten', en: 'Record decision or approval' }, icon: IconGavel, description: 'Eine Entscheidung oder Freigabe mit Begründung, entscheidender Person und Folgen tragenden Personen festhalten.' },
  { path: '/intents/massnahme-anlegen', label: { de: 'Maßnahme anlegen', en: 'Create action item' }, icon: IconChecklist, description: 'Eine oder mehrere Aufgaben, Mandate oder ausgeführte Aktionen zu einem Vorhaben anlegen.' },
  { path: '/intents/erfahrung-festhalten', label: { de: 'Erfahrung festhalten', en: 'Record lesson learned' }, icon: IconNotebook, description: 'Eine Erfahrung mit Erkenntnis und Empfehlung für künftige Vorhaben festhalten.' },
  { path: '/intents/vorhaben-zustand-wechseln', label: { de: 'Zustand wechseln', en: 'Change state' }, icon: IconArrowsExchange, description: 'Den Zustand eines Vorhabens von Entwurf zu aktiv, aktiv zu ruhend oder ruhend zu aktiv wechseln.' },
  { path: '/intents/massstab-erfassen', label: { de: 'Maßstab oder Grenze erfassen', en: 'Record criterion or boundary' }, icon: IconRuler, description: 'Einen oder mehrere Maßstäbe, Grenzen oder Erfolgskriterien zu einem Vorhaben erfassen.' },
  // </custom:intents>
];

/**
 * True only in the Phase-1 deploy bundle (the service flips it): the sidebar
 * then shows ghost rows ("werden erstellt…") until Phase 2 registers the real
 * pages and sets this back to false. Lives OUTSIDE the custom markers on
 * purpose — a scaffold update resets it to false (self-healing if Phase 2
 * never ran).
 */
export const INTENTS_PENDING = false;

/**
 * When the Phase-1 bundle was deployed (ISO, set by the service together with
 * INTENTS_PENDING). The sidebar stops showing the ghost row PENDING_MAX_MINUTES
 * later on its own: a Phase 2 that ended red (or never ran) used to leave a
 * pulsing "werden erstellt …" in every deployed Phase-1 bundle forever — no
 * code path redeploys Phase 1 without the flag (live 03.09.2026).
 */
export const INTENTS_PENDING_SINCE: string | null = '2026-11-22T10:51:10+00:00';
export const PENDING_MAX_MINUTES = 30;
