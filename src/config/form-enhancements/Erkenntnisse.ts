// Auto-generated. Per-entity form-enhancements config for "Erkenntnisse".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: ["titel", "vorhaben", {"row": ["art", "status"], "cols": "1fr 1fr"}, "schutzstufe", {"row": ["zustaendig", "datum"], "cols": "1fr 1fr"}, "herkunft", "beschreibung"],
  defaults: {
    'datum': { kind: 'today' },
    'status': { kind: 'lookup', key: 'offen', label: 'Offen' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
