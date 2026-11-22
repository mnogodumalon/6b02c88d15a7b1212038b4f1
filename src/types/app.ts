import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Beteiligte {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    beteiligter_lastname?: string;
    email?: string;
    beteiligter_firstname?: string;
    telefon?: string;
    organisation?: string;
    hat_benutzerkonto?: boolean;
    rolle?: LookupValue[];
    bemerkung?: string;
  };
}

export interface Vorhaben {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    kennung?: string;
    arbeitsbereich?: string;
    sichtbarkeit?: LookupValue;
    titel?: string;
    anlass_herkunft?: string;
    absicht?: string;
    absicht_art?: LookupValue;
    zustand?: LookupValue;
    verantwortlicher?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    vertretung?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    frist?: string; // Format: YYYY-MM-DD oder ISO String
    wiedervorlage?: string; // Format: YYYY-MM-DD oder ISO String
    abschlussdatum?: string; // Format: YYYY-MM-DD oder ISO String
    ergebnis?: string;
    abschlussgrund?: string;
    erwarteter_nutzen?: string;
  };
}

export interface MassstaebeUndGrenzen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    art?: LookupValue;
    beschreibung?: string;
    massstab_von?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    vorrang?: boolean;
  };
}

export interface Erkenntnisse {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    art?: LookupValue;
    titel?: string;
    beschreibung?: string;
    herkunft?: string;
    status?: LookupValue;
    schutzstufe?: LookupValue;
    zustaendig?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    datum?: string; // Format: YYYY-MM-DD oder ISO String
  };
}

export interface Entscheidungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    art?: LookupValue;
    gegenstand?: string;
    begruendung?: string;
    entscheider?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    folgentraeger?: RecordUrl[];
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    status?: LookupValue;
  };
}

export interface Massnahmen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    art?: LookupValue;
    titel?: string;
    beschreibung?: string;
    zustaendig?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    beauftragt_von?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    frist?: string; // Format: YYYY-MM-DD oder ISO String
    status?: LookupValue;
    ausfuehrungsdatum?: string; // Format: YYYY-MM-DD oder ISO String
    ergebnis?: string;
  };
}

export interface Erfahrungen {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    vorhaben?: RecordUrl; // applookup -> URL zu 'Vorhaben' Record
    titel?: string;
    beschreibung?: string;
    erkenntnis?: string;
    datum?: string; // Format: YYYY-MM-DD oder ISO String
    erfasser?: RecordUrl; // applookup -> URL zu 'Beteiligte' Record
    empfehlung?: string;
  };
}

export const APP_IDS = {
  BETEILIGTE: '6b02c861464500370f4829d5',
  VORHABEN: '6b02c866db355812967322ff',
  MASSSTAEBE_UND_GRENZEN: '6b02c8677f40b2cf5327f5bf',
  ERKENNTNISSE: '6b02c8689dc81fb8c1fa88bd',
  ENTSCHEIDUNGEN: '6b02c869383d2dfa8e47a8ba',
  MASSNAHMEN: '6b02c869fba0b5f1f5a06e7b',
  ERFAHRUNGEN: '6b02c86a7427d5afea8c1e98',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'beteiligte': {
    rolle: [{ key: "wissen", get label() { return lookupLabel('beteiligte', 'rolle', "wissen") ?? "Hat Wissen"; } }, { key: "entscheidet", get label() { return lookupLabel('beteiligte', 'rolle', "entscheidet") ?? "Entscheidet"; } }, { key: "traegt_folgen", get label() { return lookupLabel('beteiligte', 'rolle', "traegt_folgen") ?? "Trägt Folgen"; } }],
  },
  'vorhaben': {
    sichtbarkeit: [{ key: "nur_verantwortliche", get label() { return lookupLabel('vorhaben', 'sichtbarkeit', "nur_verantwortliche") ?? "Nur Verantwortliche"; } }, { key: "beteiligte", get label() { return lookupLabel('vorhaben', 'sichtbarkeit', "beteiligte") ?? "Beteiligte des Vorhabens"; } }, { key: "arbeitsbereich", get label() { return lookupLabel('vorhaben', 'sichtbarkeit', "arbeitsbereich") ?? "Gesamter Arbeitsbereich"; } }],
    absicht_art: [{ key: "ermoeglichen", get label() { return lookupLabel('vorhaben', 'absicht_art', "ermoeglichen") ?? "Ermöglichen"; } }, { key: "erkunden", get label() { return lookupLabel('vorhaben', 'absicht_art', "erkunden") ?? "Erkunden"; } }, { key: "verbessern", get label() { return lookupLabel('vorhaben', 'absicht_art', "verbessern") ?? "Verbessern"; } }, { key: "erhalten", get label() { return lookupLabel('vorhaben', 'absicht_art', "erhalten") ?? "Erhalten"; } }, { key: "verhindern", get label() { return lookupLabel('vorhaben', 'absicht_art', "verhindern") ?? "Verhindern"; } }],
    zustand: [{ key: "entwurf", get label() { return lookupLabel('vorhaben', 'zustand', "entwurf") ?? "Entwurf"; } }, { key: "aktiv", get label() { return lookupLabel('vorhaben', 'zustand', "aktiv") ?? "Aktiv"; } }, { key: "ruhend", get label() { return lookupLabel('vorhaben', 'zustand', "ruhend") ?? "Ruhend"; } }, { key: "beendet", get label() { return lookupLabel('vorhaben', 'zustand', "beendet") ?? "Beendet"; } }],
  },
  'massstaebe_und_grenzen': {
    art: [{ key: "erfolgskriterium", get label() { return lookupLabel('massstaebe_und_grenzen', 'art', "erfolgskriterium") ?? "Erfolgskriterium"; } }, { key: "unverzichtbar", get label() { return lookupLabel('massstaebe_und_grenzen', 'art', "unverzichtbar") ?? "Unverzichtbar"; } }, { key: "grenze", get label() { return lookupLabel('massstaebe_und_grenzen', 'art', "grenze") ?? "Grenze"; } }],
  },
  'erkenntnisse': {
    art: [{ key: "beitrag", get label() { return lookupLabel('erkenntnisse', 'art', "beitrag") ?? "Beitrag"; } }, { key: "quelle", get label() { return lookupLabel('erkenntnisse', 'art', "quelle") ?? "Quelle"; } }, { key: "annahme", get label() { return lookupLabel('erkenntnisse', 'art', "annahme") ?? "Annahme"; } }, { key: "fallfrage", get label() { return lookupLabel('erkenntnisse', 'art', "fallfrage") ?? "Fallfrage"; } }, { key: "einwand", get label() { return lookupLabel('erkenntnisse', 'art', "einwand") ?? "Einwand"; } }],
    status: [{ key: "offen", get label() { return lookupLabel('erkenntnisse', 'status', "offen") ?? "Offen"; } }, { key: "bestaetigt", get label() { return lookupLabel('erkenntnisse', 'status', "bestaetigt") ?? "Bestätigt"; } }, { key: "widerlegt", get label() { return lookupLabel('erkenntnisse', 'status', "widerlegt") ?? "Widerlegt"; } }, { key: "beantwortet", get label() { return lookupLabel('erkenntnisse', 'status', "beantwortet") ?? "Beantwortet"; } }],
    schutzstufe: [{ key: "allgemein", get label() { return lookupLabel('erkenntnisse', 'schutzstufe', "allgemein") ?? "Allgemein sichtbar"; } }, { key: "eingeschraenkt", get label() { return lookupLabel('erkenntnisse', 'schutzstufe', "eingeschraenkt") ?? "Eingeschränkt"; } }, { key: "streng", get label() { return lookupLabel('erkenntnisse', 'schutzstufe', "streng") ?? "Streng geschützt"; } }],
  },
  'entscheidungen': {
    art: [{ key: "entscheidung", get label() { return lookupLabel('entscheidungen', 'art', "entscheidung") ?? "Entscheidung"; } }, { key: "freigabe", get label() { return lookupLabel('entscheidungen', 'art', "freigabe") ?? "Freigabe"; } }],
    status: [{ key: "beantragt", get label() { return lookupLabel('entscheidungen', 'status', "beantragt") ?? "Beantragt"; } }, { key: "erteilt", get label() { return lookupLabel('entscheidungen', 'status', "erteilt") ?? "Erteilt"; } }, { key: "abgelehnt", get label() { return lookupLabel('entscheidungen', 'status', "abgelehnt") ?? "Abgelehnt"; } }, { key: "zurueckgestellt", get label() { return lookupLabel('entscheidungen', 'status', "zurueckgestellt") ?? "Zurückgestellt"; } }],
  },
  'massnahmen': {
    art: [{ key: "aufgabe", get label() { return lookupLabel('massnahmen', 'art', "aufgabe") ?? "Aufgabe"; } }, { key: "mandat", get label() { return lookupLabel('massnahmen', 'art', "mandat") ?? "Mandat"; } }, { key: "aktion", get label() { return lookupLabel('massnahmen', 'art', "aktion") ?? "Ausgeführte Aktion"; } }],
    status: [{ key: "offen", get label() { return lookupLabel('massnahmen', 'status', "offen") ?? "Offen"; } }, { key: "in_arbeit", get label() { return lookupLabel('massnahmen', 'status', "in_arbeit") ?? "In Arbeit"; } }, { key: "erledigt", get label() { return lookupLabel('massnahmen', 'status', "erledigt") ?? "Erledigt"; } }, { key: "verworfen", get label() { return lookupLabel('massnahmen', 'status', "verworfen") ?? "Verworfen"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'beteiligte': {
    'beteiligter_lastname': 'string/text',
    'email': 'string/email',
    'beteiligter_firstname': 'string/text',
    'telefon': 'string/tel',
    'organisation': 'string/text',
    'hat_benutzerkonto': 'bool',
    'rolle': 'multiplelookup/checkbox',
    'bemerkung': 'string/textarea',
  },
  'vorhaben': {
    'kennung': 'string/text',
    'arbeitsbereich': 'string/text',
    'sichtbarkeit': 'lookup/radio',
    'titel': 'string/text',
    'anlass_herkunft': 'string/textarea',
    'absicht': 'string/textarea',
    'absicht_art': 'lookup/select',
    'zustand': 'lookup/radio',
    'verantwortlicher': 'applookup/select',
    'vertretung': 'applookup/select',
    'frist': 'date/date',
    'wiedervorlage': 'date/date',
    'abschlussdatum': 'date/date',
    'ergebnis': 'string/textarea',
    'abschlussgrund': 'string/textarea',
    'erwarteter_nutzen': 'string/textarea',
  },
  'massstaebe_und_grenzen': {
    'vorhaben': 'applookup/select',
    'art': 'lookup/radio',
    'beschreibung': 'string/textarea',
    'massstab_von': 'applookup/select',
    'vorrang': 'bool',
  },
  'erkenntnisse': {
    'vorhaben': 'applookup/select',
    'art': 'lookup/select',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'herkunft': 'string/text',
    'status': 'lookup/select',
    'schutzstufe': 'lookup/select',
    'zustaendig': 'applookup/select',
    'datum': 'date/date',
  },
  'entscheidungen': {
    'vorhaben': 'applookup/select',
    'art': 'lookup/radio',
    'gegenstand': 'string/text',
    'begruendung': 'string/textarea',
    'entscheider': 'applookup/select',
    'folgentraeger': 'multipleapplookup/select',
    'datum': 'date/date',
    'status': 'lookup/select',
  },
  'massnahmen': {
    'vorhaben': 'applookup/select',
    'art': 'lookup/radio',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'zustaendig': 'applookup/select',
    'beauftragt_von': 'applookup/select',
    'frist': 'date/date',
    'status': 'lookup/select',
    'ausfuehrungsdatum': 'date/datetimeminute',
    'ergebnis': 'string/textarea',
  },
  'erfahrungen': {
    'vorhaben': 'applookup/select',
    'titel': 'string/text',
    'beschreibung': 'string/textarea',
    'erkenntnis': 'string/textarea',
    'datum': 'date/date',
    'erfasser': 'applookup/select',
    'empfehlung': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
  'beteiligte': [
    { field: 'verantwortlicher', entity: 'vorhaben' },
    { field: 'vertretung', entity: 'vorhaben' },
    { field: 'massstab_von', entity: 'massstaebe_und_grenzen' },
    { field: 'zustaendig', entity: 'erkenntnisse' },
    { field: 'entscheider', entity: 'entscheidungen' },
    { field: 'folgentraeger', entity: 'entscheidungen' },
    { field: 'zustaendig', entity: 'massnahmen' },
    { field: 'beauftragt_von', entity: 'massnahmen' },
    { field: 'erfasser', entity: 'erfahrungen' },
  ],
  'vorhaben': [
    { field: 'vorhaben', entity: 'massstaebe_und_grenzen' },
    { field: 'vorhaben', entity: 'erkenntnisse' },
    { field: 'vorhaben', entity: 'entscheidungen' },
    { field: 'vorhaben', entity: 'massnahmen' },
    { field: 'vorhaben', entity: 'erfahrungen' },
  ],
};

// Aliases for the pre-0.0.279 app keys (see 4c).
LOOKUP_OPTIONS['maßstaebe_und_grenzen'] = LOOKUP_OPTIONS['massstaebe_und_grenzen'];
FIELD_TYPES['maßstaebe_und_grenzen'] = FIELD_TYPES['massstaebe_und_grenzen'];
LOOKUP_OPTIONS['maßnahmen'] = LOOKUP_OPTIONS['massnahmen'];
FIELD_TYPES['maßnahmen'] = FIELD_TYPES['massnahmen'];

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateBeteiligte = StripLookup<Beteiligte['fields']>;
export type CreateVorhaben = StripLookup<Vorhaben['fields']>;
export type CreateMassstaebeUndGrenzen = StripLookup<MassstaebeUndGrenzen['fields']>;
export type CreateErkenntnisse = StripLookup<Erkenntnisse['fields']>;
export type CreateEntscheidungen = StripLookup<Entscheidungen['fields']>;
export type CreateMassnahmen = StripLookup<Massnahmen['fields']>;
export type CreateErfahrungen = StripLookup<Erfahrungen['fields']>;