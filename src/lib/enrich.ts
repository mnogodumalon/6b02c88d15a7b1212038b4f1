import type { EnrichedEntscheidungen, EnrichedErfahrungen, EnrichedErkenntnisse, EnrichedMassnahmen, EnrichedMassstaebeUndGrenzen, EnrichedVorhaben } from '@/types/enriched';
import type { Beteiligte, Entscheidungen, Erfahrungen, Erkenntnisse, Massnahmen, MassstaebeUndGrenzen, Vorhaben } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import { displayPart } from '@/lib/journey/rules';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => displayPart(r.fields[f])).filter(Boolean).join(' ').trim();
}

interface VorhabenMaps {
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichVorhaben(
  vorhaben: Vorhaben[],
  maps: VorhabenMaps
): EnrichedVorhaben[] {
  return vorhaben.map(r => ({
    ...r,
    verantwortlicherName: resolveDisplay(r.fields.verantwortlicher, maps.beteiligteMap, 'beteiligter_lastname'),
    vertretungName: resolveDisplay(r.fields.vertretung, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}

interface MassstaebeUndGrenzenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichMassstaebeUndGrenzen(
  massstaebeUndGrenzen: MassstaebeUndGrenzen[],
  maps: MassstaebeUndGrenzenMaps
): EnrichedMassstaebeUndGrenzen[] {
  return massstaebeUndGrenzen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    massstab_vonName: resolveDisplay(r.fields.massstab_von, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}

interface ErkenntnisseMaps {
  vorhabenMap: Map<string, Vorhaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichErkenntnisse(
  erkenntnisse: Erkenntnisse[],
  maps: ErkenntnisseMaps
): EnrichedErkenntnisse[] {
  return erkenntnisse.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    zustaendigName: resolveDisplay(r.fields.zustaendig, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}

interface EntscheidungenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichEntscheidungen(
  entscheidungen: Entscheidungen[],
  maps: EntscheidungenMaps
): EnrichedEntscheidungen[] {
  return entscheidungen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    entscheiderName: resolveDisplay(r.fields.entscheider, maps.beteiligteMap, 'beteiligter_lastname'),
    folgentraegerName: resolveDisplay(r.fields.folgentraeger, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}

interface MassnahmenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichMassnahmen(
  massnahmen: Massnahmen[],
  maps: MassnahmenMaps
): EnrichedMassnahmen[] {
  return massnahmen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    zustaendigName: resolveDisplay(r.fields.zustaendig, maps.beteiligteMap, 'beteiligter_lastname'),
    beauftragt_vonName: resolveDisplay(r.fields.beauftragt_von, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}

interface ErfahrungenMaps {
  vorhabenMap: Map<string, Vorhaben>;
  beteiligteMap: Map<string, Beteiligte>;
}

export function enrichErfahrungen(
  erfahrungen: Erfahrungen[],
  maps: ErfahrungenMaps
): EnrichedErfahrungen[] {
  return erfahrungen.map(r => ({
    ...r,
    vorhabenName: resolveDisplay(r.fields.vorhaben, maps.vorhabenMap, 'titel'),
    erfasserName: resolveDisplay(r.fields.erfasser, maps.beteiligteMap, 'beteiligter_lastname'),
  }));
}
