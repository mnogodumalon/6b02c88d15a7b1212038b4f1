import type { Entscheidungen, Erfahrungen, Erkenntnisse, Massnahmen, MassstaebeUndGrenzen, Vorhaben } from './app';

export type EnrichedVorhaben = Vorhaben & {
  verantwortlicherName: string;
  vertretungName: string;
};

export type EnrichedMassstaebeUndGrenzen = MassstaebeUndGrenzen & {
  vorhabenName: string;
  massstab_vonName: string;
};

export type EnrichedErkenntnisse = Erkenntnisse & {
  vorhabenName: string;
  zustaendigName: string;
};

export type EnrichedEntscheidungen = Entscheidungen & {
  vorhabenName: string;
  entscheiderName: string;
  folgentraegerName: string;
};

export type EnrichedMassnahmen = Massnahmen & {
  vorhabenName: string;
  zustaendigName: string;
  beauftragt_vonName: string;
};

export type EnrichedErfahrungen = Erfahrungen & {
  vorhabenName: string;
  erfasserName: string;
};
