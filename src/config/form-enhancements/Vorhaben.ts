// Auto-generated. Per-entity form-enhancements config for "Vorhaben".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["titel", "kennung"], "cols": "2fr 1fr"}, {"row": ["arbeitsbereich", "sichtbarkeit"], "cols": "1fr 1fr"}, "zustand", "absicht_art", {"row": ["verantwortlicher", "vertretung"], "cols": "1fr 1fr"}, {"row": ["frist", "wiedervorlage"], "cols": "1fr 1fr"}, "abschlussdatum", "anlass_herkunft", "absicht", "erwarteter_nutzen", "ergebnis", "abschlussgrund"],
  defaults: {
    'zustand': { kind: 'lookup', key: 'entwurf', label: 'Entwurf' },
  },
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
