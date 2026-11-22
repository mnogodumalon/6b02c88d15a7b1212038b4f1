/**
 * Required-field messages — WRITTEN BY THE BUILD AGENT, never by a heuristic.
 *
 * The layer knows two things about an empty required field: that it is
 * required and what its label is. Out of that it can only say „„Anreise" ist
 * ein Pflichtfeld". What the person should do instead („Bitte einen Gast
 * auswählen.") is meaning, and meaning is the agent's: the Phase-2 orchestrator
 * writes one short instruction per required field — what is needed, not why — to
 * `.intents-staging/messages.json`, the integration step validates it against
 * the app metadata and renders it into the block below. Scaffold updates keep
 * the block. Do not edit outside the markers.
 *
 * Every door reads this and nothing else: `useStepForm` (flows and public
 * pages), the generated {Entity}Dialog and the public form's server-error line.
 * A field without a sentence falls back to the label sentence — never to a
 * bare „Dieses Feld ist erforderlich".
 *
 * Required fields per entity (from the base view):
 *   - beteiligte: beteiligter_lastname (Nachname), beteiligter_firstname (Vorname)
 *   - vorhaben: arbeitsbereich (Arbeitsbereich), sichtbarkeit (Sichtbarkeit), anlass_herkunft (Anlass und Herkunft), zustand (Zustand)
 *   - massstaebe_und_grenzen: vorhaben (Vorhaben), art (Art), beschreibung (Beschreibung)
 *   - erkenntnisse: vorhaben (Vorhaben), art (Art), titel (Titel)
 *   - entscheidungen: vorhaben (Vorhaben), art (Art), gegenstand (Gegenstand)
 *   - massnahmen: vorhaben (Vorhaben), art (Art), titel (Titel)
 *   - erfahrungen: vorhaben (Vorhaben), titel (Titel)
 */
import { t, tx } from '@/i18n';
import { labelOf, type EntityKey } from './rules';

/** The writable fields of each entity — the keys a message may address (generated). */
export interface MessageFields {
  "beteiligte": "beteiligter_lastname" | "email" | "beteiligter_firstname" | "telefon" | "organisation" | "hat_benutzerkonto" | "rolle" | "bemerkung";
  "vorhaben": "kennung" | "arbeitsbereich" | "sichtbarkeit" | "titel" | "anlass_herkunft" | "absicht" | "absicht_art" | "zustand" | "verantwortlicher" | "vertretung" | "frist" | "wiedervorlage" | "abschlussdatum" | "ergebnis" | "abschlussgrund" | "erwarteter_nutzen";
  "massstaebe_und_grenzen": "vorhaben" | "art" | "beschreibung" | "massstab_von" | "vorrang";
  "erkenntnisse": "vorhaben" | "art" | "titel" | "beschreibung" | "herkunft" | "status" | "schutzstufe" | "zustaendig" | "datum";
  "entscheidungen": "vorhaben" | "art" | "gegenstand" | "begruendung" | "entscheider" | "folgentraeger" | "datum" | "status";
  "massnahmen": "vorhaben" | "art" | "titel" | "beschreibung" | "zustaendig" | "beauftragt_von" | "frist" | "status" | "ausfuehrungsdatum" | "ergebnis";
  "erfahrungen": "vorhaben" | "titel" | "beschreibung" | "erkenntnis" | "datum" | "erfasser" | "empfehlung";
}
export type MessageFieldKey<E extends EntityKey> = E extends keyof MessageFields ? MessageFields[E] : never;

export const REQUIRED_MESSAGES: { [E in EntityKey]?: Partial<Record<MessageFieldKey<E>, string>> } = {
  // <custom:messages>
  beteiligte: { beteiligter_lastname: "Bitte den Nachnamen eingeben.", beteiligter_firstname: "Bitte den Vornamen eingeben." },
  vorhaben: { arbeitsbereich: "Bitte den Arbeitsbereich angeben.", sichtbarkeit: "Bitte die Sichtbarkeit wählen.", anlass_herkunft: "Bitte Anlass und Herkunft beschreiben.", zustand: "Bitte einen Zustand wählen." },
  massstaebe_und_grenzen: { vorhaben: "Bitte ein Vorhaben auswählen.", art: "Bitte die Art wählen.", beschreibung: "Bitte den Maßstab oder die Grenze beschreiben." },
  erkenntnisse: { vorhaben: "Bitte ein Vorhaben auswählen.", art: "Bitte die Art der Erkenntnis wählen.", titel: "Bitte einen Titel eingeben." },
  entscheidungen: { vorhaben: "Bitte ein Vorhaben auswählen.", art: "Bitte Entscheidung oder Freigabe wählen.", gegenstand: "Bitte den Gegenstand eingeben." },
  massnahmen: { vorhaben: "Bitte ein Vorhaben auswählen.", art: "Bitte die Art der Maßnahme wählen.", titel: "Bitte einen Titel eingeben." },
  erfahrungen: { vorhaben: "Bitte ein Vorhaben auswählen.", titel: "Bitte einen Titel eingeben." },
  // </custom:messages>
};

/** The sentence shown when `key` of `entity` is required and empty — the
 *  agent's own text (translated at runtime like every page string), else the
 *  label sentence. Call it while rendering, not at module scope. */
export function requiredMessage(entity: EntityKey, key: string): string {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  if (own && own.trim()) return tx(own);
  return t('v_required', { label: labelOf(entity, key) });
}

/** True when the agent wrote a sentence for the field. */
export function hasOwnMessage(entity: EntityKey, key: string): boolean {
  const own = (REQUIRED_MESSAGES as Record<string, Record<string, string | undefined> | undefined>)[entity]?.[key];
  return Boolean(own && own.trim());
}
