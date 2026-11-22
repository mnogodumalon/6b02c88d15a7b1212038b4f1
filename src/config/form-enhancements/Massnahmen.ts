// Auto-generated. Per-entity form-enhancements config for "Maßnahmen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", "titel", {"row": ["art", "status"], "cols": "1fr 1fr"}, {"row": ["zustaendig", "beauftragt_von"], "cols": "1fr 1fr"}, {"row": ["frist", "ausfuehrungsdatum"], "cols": "1fr 1fr"}, "beschreibung", "ergebnis"],
  defaults: {
    'frist': { kind: 'todayOffset', days: 14 },
    'status': { kind: 'lookup', key: 'offen', label: 'Offen' },
    'art': { kind: 'lookup', key: 'aufgabe', label: 'Aufgabe' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
