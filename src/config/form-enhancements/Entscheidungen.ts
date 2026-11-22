// Auto-generated. Per-entity form-enhancements config for "Entscheidungen".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["vorhaben", "gegenstand", "art", {"row": ["status", "datum"], "cols": "1fr 1fr"}, "entscheider", "folgentraeger", "begruendung"],
  defaults: {
    'datum': { kind: 'today' },
    'art': { kind: 'lookup', key: 'entscheidung', label: 'Entscheidung' },
    'status': { kind: 'lookup', key: 'beantragt', label: 'Beantragt' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
