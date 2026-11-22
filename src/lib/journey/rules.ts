/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'beteiligte' | 'vorhaben' | 'massstaebe_und_grenzen' | 'erkenntnisse' | 'entscheidungen' | 'massnahmen' | 'erfahrungen';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "beteiligte": "beteiligter_lastname" | "email" | "beteiligter_firstname" | "telefon" | "organisation" | "bemerkung";
  "vorhaben": "kennung" | "arbeitsbereich" | "titel" | "anlass_herkunft" | "absicht" | "ergebnis" | "abschlussgrund" | "erwarteter_nutzen";
  "massstaebe_und_grenzen": "beschreibung";
  "erkenntnisse": "titel" | "beschreibung" | "herkunft";
  "entscheidungen": "gegenstand" | "begruendung";
  "massnahmen": "titel" | "beschreibung" | "ergebnis";
  "erfahrungen": "titel" | "beschreibung" | "erkenntnis" | "empfehlung";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "beteiligte": never;
  "vorhaben": "verantwortlicher" | "vertretung";
  "massstaebe_und_grenzen": "vorhaben" | "massstab_von";
  "erkenntnisse": "vorhaben" | "zustaendig";
  "entscheidungen": "vorhaben" | "entscheider" | "folgentraeger";
  "massnahmen": "vorhaben" | "zustaendig" | "beauftragt_von";
  "erfahrungen": "vorhaben" | "erfasser";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it as a value. `file` is false: a file is UPLOADED
   *  (`form.file(key)` → FileField; the chosen file travels in the create as a data URL). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "beteiligte": {
    "key": "beteiligte",
    "appId": "6b02c861464500370f4829d5",
    "label": "Beteiligte",
    "pascal": "Beteiligte",
    "single": "BeteiligteEntry"
  },
  "vorhaben": {
    "key": "vorhaben",
    "appId": "6b02c866db355812967322ff",
    "label": "Vorhaben",
    "pascal": "Vorhaben",
    "single": "VorhabenEntry"
  },
  "massstaebe_und_grenzen": {
    "key": "massstaebe_und_grenzen",
    "appId": "6b02c8677f40b2cf5327f5bf",
    "label": "Maßstäbe und Grenzen",
    "pascal": "MassstaebeUndGrenzen",
    "single": "MassstaebeUndGrenzenEntry"
  },
  "erkenntnisse": {
    "key": "erkenntnisse",
    "appId": "6b02c8689dc81fb8c1fa88bd",
    "label": "Erkenntnisse",
    "pascal": "Erkenntnisse",
    "single": "ErkenntnisseEntry"
  },
  "entscheidungen": {
    "key": "entscheidungen",
    "appId": "6b02c869383d2dfa8e47a8ba",
    "label": "Entscheidungen",
    "pascal": "Entscheidungen",
    "single": "EntscheidungenEntry"
  },
  "massnahmen": {
    "key": "massnahmen",
    "appId": "6b02c869fba0b5f1f5a06e7b",
    "label": "Maßnahmen",
    "pascal": "Massnahmen",
    "single": "MassnahmenEntry"
  },
  "erfahrungen": {
    "key": "erfahrungen",
    "appId": "6b02c86a7427d5afea8c1e98",
    "label": "Erfahrungen",
    "pascal": "Erfahrungen",
    "single": "ErfahrungenEntry"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "beteiligte": {
    "beteiligter_lastname": {
      "key": "beteiligter_lastname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Nachname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "family-name"
    },
    "email": {
      "key": "email",
      "fulltype": "string/email",
      "kind": "email",
      "required": false,
      "label": "E-Mail",
      "writable": true,
      "autoComplete": "email"
    },
    "beteiligter_firstname": {
      "key": "beteiligter_firstname",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Vorname",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "given-name"
    },
    "telefon": {
      "key": "telefon",
      "fulltype": "string/tel",
      "kind": "tel",
      "required": false,
      "label": "Telefon",
      "writable": true,
      "autoComplete": "tel"
    },
    "organisation": {
      "key": "organisation",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Organisation",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "organization"
    },
    "hat_benutzerkonto": {
      "key": "hat_benutzerkonto",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Hat ein Benutzerkonto",
      "writable": true
    },
    "rolle": {
      "key": "rolle",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Rolle",
      "writable": true,
      "options": [
        "wissen",
        "entscheidet",
        "traegt_folgen"
      ]
    },
    "bemerkung": {
      "key": "bemerkung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Bemerkung",
      "writable": true
    }
  },
  "vorhaben": {
    "kennung": {
      "key": "kennung",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Kennung",
      "writable": true,
      "maxLength": 4000
    },
    "arbeitsbereich": {
      "key": "arbeitsbereich",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Arbeitsbereich",
      "writable": true,
      "maxLength": 4000
    },
    "sichtbarkeit": {
      "key": "sichtbarkeit",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Sichtbarkeit",
      "writable": true,
      "options": [
        "nur_verantwortliche",
        "beteiligte",
        "arbeitsbereich"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "anlass_herkunft": {
      "key": "anlass_herkunft",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Anlass und Herkunft",
      "writable": true
    },
    "absicht": {
      "key": "absicht",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Aktuelle Absicht",
      "writable": true
    },
    "absicht_art": {
      "key": "absicht_art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Art der Absicht",
      "writable": true,
      "options": [
        "ermoeglichen",
        "erkunden",
        "verbessern",
        "erhalten",
        "verhindern"
      ]
    },
    "zustand": {
      "key": "zustand",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Zustand",
      "writable": true,
      "options": [
        "entwurf",
        "aktiv",
        "ruhend",
        "beendet"
      ]
    },
    "verantwortlicher": {
      "key": "verantwortlicher",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Verantwortliche Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "vertretung": {
      "key": "vertretung",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Vertretung bei Abwesenheit",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "frist": {
      "key": "frist",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Frist",
      "writable": true
    },
    "wiedervorlage": {
      "key": "wiedervorlage",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Wiedervorlage",
      "writable": true
    },
    "abschlussdatum": {
      "key": "abschlussdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Abschlussdatum",
      "writable": true
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ergebnis",
      "writable": true
    },
    "abschlussgrund": {
      "key": "abschlussgrund",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Abschlussgrund",
      "writable": true
    },
    "erwarteter_nutzen": {
      "key": "erwarteter_nutzen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Erwarteter Nutzen und spätere Überprüfung",
      "writable": true
    }
  },
  "massstaebe_und_grenzen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6b02c866db355812967322ff",
      "targetEntity": "vorhaben"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "erfolgskriterium",
        "unverzichtbar",
        "grenze"
      ]
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": true,
      "label": "Beschreibung",
      "writable": true
    },
    "massstab_von": {
      "key": "massstab_von",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Maßstab von",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "vorrang": {
      "key": "vorrang",
      "fulltype": "bool",
      "kind": "bool",
      "required": false,
      "label": "Hat Vorrang im Konfliktfall",
      "writable": true
    }
  },
  "erkenntnisse": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6b02c866db355812967322ff",
      "targetEntity": "vorhaben"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "beitrag",
        "quelle",
        "annahme",
        "fallfrage",
        "einwand"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "herkunft": {
      "key": "herkunft",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Herkunft",
      "writable": true,
      "maxLength": 4000
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status",
      "writable": true,
      "options": [
        "offen",
        "bestaetigt",
        "widerlegt",
        "beantwortet"
      ]
    },
    "schutzstufe": {
      "key": "schutzstufe",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Schutzstufe",
      "writable": true,
      "options": [
        "allgemein",
        "eingeschraenkt",
        "streng"
      ]
    },
    "zustaendig": {
      "key": "zustaendig",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zuständige Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "datum": {
      "key": "datum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    }
  },
  "entscheidungen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6b02c866db355812967322ff",
      "targetEntity": "vorhaben"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "entscheidung",
        "freigabe"
      ]
    },
    "gegenstand": {
      "key": "gegenstand",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Gegenstand",
      "writable": true,
      "maxLength": 4000
    },
    "begruendung": {
      "key": "begruendung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Begründung",
      "writable": true
    },
    "entscheider": {
      "key": "entscheider",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Entscheidende Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "folgentraeger": {
      "key": "folgentraeger",
      "fulltype": "multipleapplookup/select",
      "kind": "multirecord",
      "required": false,
      "label": "Folgen tragende Personen",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "datum": {
      "key": "datum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status",
      "writable": true,
      "options": [
        "beantragt",
        "erteilt",
        "abgelehnt",
        "zurueckgestellt"
      ]
    }
  },
  "massnahmen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6b02c866db355812967322ff",
      "targetEntity": "vorhaben"
    },
    "art": {
      "key": "art",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": true,
      "label": "Art",
      "writable": true,
      "options": [
        "aufgabe",
        "mandat",
        "aktion"
      ]
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "zustaendig": {
      "key": "zustaendig",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Zuständige Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "beauftragt_von": {
      "key": "beauftragt_von",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Beauftragende Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "frist": {
      "key": "frist",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Frist",
      "writable": true
    },
    "status": {
      "key": "status",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Status",
      "writable": true,
      "options": [
        "offen",
        "in_arbeit",
        "erledigt",
        "verworfen"
      ]
    },
    "ausfuehrungsdatum": {
      "key": "ausfuehrungsdatum",
      "fulltype": "date/datetimeminute",
      "kind": "datetime",
      "required": false,
      "label": "Ausführungsdatum",
      "writable": true
    },
    "ergebnis": {
      "key": "ergebnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Ergebnis",
      "writable": true
    }
  },
  "erfahrungen": {
    "vorhaben": {
      "key": "vorhaben",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": true,
      "label": "Vorhaben",
      "writable": true,
      "targetAppId": "6b02c866db355812967322ff",
      "targetEntity": "vorhaben"
    },
    "titel": {
      "key": "titel",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Titel",
      "writable": true,
      "maxLength": 4000
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    },
    "erkenntnis": {
      "key": "erkenntnis",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Erkenntnis",
      "writable": true
    },
    "datum": {
      "key": "datum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Datum",
      "writable": true
    },
    "erfasser": {
      "key": "erfasser",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Erfassende Person",
      "writable": true,
      "targetAppId": "6b02c861464500370f4829d5",
      "targetEntity": "beteiligte"
    },
    "empfehlung": {
      "key": "empfehlung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Empfehlung für künftige Vorhaben",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "beteiligte": [],
  "vorhaben": [
    {
      "kind": "choice",
      "field": "sichtbarkeit",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "absicht_art",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "zustand",
      "count": 4
    },
    {
      "kind": "record",
      "field": "verantwortlicher",
      "targetEntity": "beteiligte"
    },
    {
      "kind": "record",
      "field": "vertretung",
      "targetEntity": "beteiligte"
    }
  ],
  "massstaebe_und_grenzen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "massstab_von",
      "targetEntity": "beteiligte"
    }
  ],
  "erkenntnisse": [
    {
      "kind": "choice",
      "field": "art",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "schutzstufe",
      "count": 3
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "zustaendig",
      "targetEntity": "beteiligte"
    }
  ],
  "entscheidungen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 2
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "entscheider",
      "targetEntity": "beteiligte"
    },
    {
      "kind": "record",
      "field": "folgentraeger",
      "targetEntity": "beteiligte"
    }
  ],
  "massnahmen": [
    {
      "kind": "choice",
      "field": "art",
      "count": 3
    },
    {
      "kind": "choice",
      "field": "status",
      "count": 4
    },
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "zustaendig",
      "targetEntity": "beteiligte"
    },
    {
      "kind": "record",
      "field": "beauftragt_von",
      "targetEntity": "beteiligte"
    }
  ],
  "erfahrungen": [
    {
      "kind": "record",
      "field": "vorhaben",
      "targetEntity": "vorhaben"
    },
    {
      "kind": "record",
      "field": "erfasser",
      "targetEntity": "beteiligte"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "beteiligte": [
    "beteiligter_lastname"
  ],
  "vorhaben": [
    "titel"
  ],
  "massstaebe_und_grenzen": [
    "beschreibung"
  ],
  "erkenntnisse": [
    "titel"
  ],
  "entscheidungen": [
    "gegenstand"
  ],
  "massnahmen": [
    "titel"
  ],
  "erfahrungen": [
    "titel"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
/** A date reads as a date (a target whose only readable fields are `beginn`/`ende` — Doodle KB 6),
 *  a number as a number; a record URL or a bare id is never a name (0.0.389). */
export function displayPart(v: unknown): string {
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return formatDate(s);
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return formatDateTime(s);
    if (/^https?:\/\//.test(s) || /^[0-9a-f]{24}$/i.test(s)) return '';
    return s;
  }
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '';
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

/** „Nicht ausgefüllt“ for a required field, by its kind: a checkbox that is
 *  `false` is NOT filled — the person did not consent (live 03.11.2026: a
 *  consent page validated with the box unticked and the grant took it). Every
 *  other kind is isEmptyValue. */
export function isUnfilled(entity: EntityKey, key: string, v: unknown): boolean {
  if (ruleOf(entity, key)?.kind === 'bool') return v !== true;
  return isEmptyValue(v);
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
