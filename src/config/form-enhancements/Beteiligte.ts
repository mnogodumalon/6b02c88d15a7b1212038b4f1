// Auto-generated. Per-entity form-enhancements config for "Beteiligte".
// Written by the backend form polish (app/services/form_polish.py) from the
// generator's manifest; scripts/parse-formulas.mjs expands the formula strings.
// Schema: see ./types.ts.

import type { FormEnhancements } from './types';

export const formEnhancements: FormEnhancements = {
  fieldOrder: [{"row": ["beteiligter_firstname", "beteiligter_lastname"], "cols": "1fr 1fr"}, "organisation", {"row": ["email", "telefon"], "cols": "1fr 1fr"}, "rolle", "hat_benutzerkonto", "bemerkung"],
  defaults: {},
  computed: {},
};

export const computedDeps: Record<string, string[]> = {};
export const computedApplookupRefs: Record<string, {lookupKey: string}[]> = {};
