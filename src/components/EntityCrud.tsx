/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'beteiligte'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.beteiligte.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.beteiligte.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.beteiligte.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.beteiligte              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   beteiligte: beteiligter_lastname, email, beteiligter_firstname, telefon, organisation, hat_benutzerkonto, rolle, bemerkung  ·  ← vorhaben (list + contextual +) · ← vorhaben (list + contextual +) · ← massstaebe_und_grenzen (list + contextual +) · ← erkenntnisse (list + contextual +) · ← entscheidungen (list + contextual +) · ← entscheidungen (list + contextual + + choose existing) · ← massnahmen (list + contextual +) · ← massnahmen (list + contextual +) · ← erfahrungen (list + contextual +)
 *   vorhaben: kennung, arbeitsbereich, sichtbarkeit, titel, anlass_herkunft, absicht, absicht_art, zustand, …  ·  → beteiligte · ← massstaebe_und_grenzen (list + contextual +) · ← erkenntnisse (list + contextual +) · ← entscheidungen (list + contextual +) · ← massnahmen (list + contextual +) · ← erfahrungen (list + contextual +)
 *   massstaebe_und_grenzen: vorhaben, art, beschreibung, massstab_von, vorrang  ·  → vorhaben · → beteiligte
 *   erkenntnisse: vorhaben, art, titel, beschreibung, herkunft, status, schutzstufe, zustaendig, …  ·  → vorhaben · → beteiligte
 *   entscheidungen: vorhaben, art, gegenstand, begruendung, entscheider, folgentraeger, datum, status  ·  → vorhaben · → beteiligte
 *   massnahmen: vorhaben, art, titel, beschreibung, zustaendig, beauftragt_von, frist, status, …  ·  → vorhaben · → beteiligte
 *   erfahrungen: vorhaben, titel, beschreibung, erkenntnis, datum, erfasser, empfehlung  ·  → vorhaben · → beteiligte
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Beteiligte, Vorhaben, MassstaebeUndGrenzen, Erkenntnisse, Entscheidungen, Massnahmen, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl, extractRecordIds } from '@/services/livingAppsService';
import { enrichVorhaben, enrichMassstaebeUndGrenzen, enrichErkenntnisse, enrichEntscheidungen, enrichMassnahmen, enrichErfahrungen } from '@/lib/enrich';
import type { EnrichedVorhaben, EnrichedMassstaebeUndGrenzen, EnrichedErkenntnisse, EnrichedEntscheidungen, EnrichedMassnahmen, EnrichedErfahrungen } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { BeteiligteDialog, type BeteiligteDialogDefaults } from '@/components/dialogs/BeteiligteDialog';
import { BeteiligteDetails } from '@/components/details/BeteiligteDetails';
import { VorhabenDialog, type VorhabenDialogDefaults } from '@/components/dialogs/VorhabenDialog';
import { VorhabenDetails } from '@/components/details/VorhabenDetails';
import { MassstaebeUndGrenzenDialog, type MassstaebeUndGrenzenDialogDefaults } from '@/components/dialogs/MassstaebeUndGrenzenDialog';
import { MassstaebeUndGrenzenDetails } from '@/components/details/MassstaebeUndGrenzenDetails';
import { ErkenntnisseDialog, type ErkenntnisseDialogDefaults } from '@/components/dialogs/ErkenntnisseDialog';
import { ErkenntnisseDetails } from '@/components/details/ErkenntnisseDetails';
import { EntscheidungenDialog, type EntscheidungenDialogDefaults } from '@/components/dialogs/EntscheidungenDialog';
import { EntscheidungenDetails } from '@/components/details/EntscheidungenDetails';
import { MassnahmenDialog, type MassnahmenDialogDefaults } from '@/components/dialogs/MassnahmenDialog';
import { MassnahmenDetails } from '@/components/details/MassnahmenDetails';
import { ErfahrungenDialog, type ErfahrungenDialogDefaults } from '@/components/dialogs/ErfahrungenDialog';
import { ErfahrungenDetails } from '@/components/details/ErfahrungenDetails';
import { PickExistingDialog } from '@/components/PickExistingDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { usePermissions } from '@/lib/permissions';
import { toast } from 'sonner';
import { syncDoorsAfterWrite } from '@/lib/publicDoors';
import { displayNameOf, displayPart } from '@/lib/journey/rules';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'beteiligte'; record: Beteiligte }
  | { type: 'vorhaben'; record: EnrichedVorhaben }
  | { type: 'massstaebeUndGrenzen'; record: EnrichedMassstaebeUndGrenzen }
  | { type: 'erkenntnisse'; record: EnrichedErkenntnisse }
  | { type: 'entscheidungen'; record: EnrichedEntscheidungen }
  | { type: 'massnahmen'; record: EnrichedMassnahmen }
  | { type: 'erfahrungen'; record: EnrichedErfahrungen };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  /** The action may return a sentence — the reason the step was NOT taken; the overlay shows it under the button. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void | string | Promise<void | string> } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
  /** May the signed-in user create/change records of this list? (the
   *  platform's rights — show a „+ Neu“ only when true; openCreate/openEdit
   *  refuse with a notice otherwise). */
  canWrite: boolean;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  beteiligte: EntityCrudApi<Beteiligte, BeteiligteDialogDefaults>;
  vorhaben: EntityCrudApi<Vorhaben, VorhabenDialogDefaults>;
  massstaebeUndGrenzen: EntityCrudApi<MassstaebeUndGrenzen, MassstaebeUndGrenzenDialogDefaults>;
  erkenntnisse: EntityCrudApi<Erkenntnisse, ErkenntnisseDialogDefaults>;
  entscheidungen: EntityCrudApi<Entscheidungen, EntscheidungenDialogDefaults>;
  massnahmen: EntityCrudApi<Massnahmen, MassnahmenDialogDefaults>;
  erfahrungen: EntityCrudApi<Erfahrungen, ErfahrungenDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { beteiligte: Beteiligte[]; vorhaben: EnrichedVorhaben[]; massstaebeUndGrenzen: EnrichedMassstaebeUndGrenzen[]; erkenntnisse: EnrichedErkenntnisse[]; entscheidungen: EnrichedEntscheidungen[]; massnahmen: EnrichedMassnahmen[]; erfahrungen: EnrichedErfahrungen[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  // the platform's rights of the signed-in user (lib/permissions.ts) — unknown = allowed
  const perms = usePermissions();
  const refuse = () => { toast.error(t('perm_denied_title'), { description: t('perm_denied_desc') }); };
  const [beteiligteDialog, setBeteiligteDialog] = useState<{ defaults?: BeteiligteDialogDefaults; editing?: Beteiligte } | null>(null);
  const [vorhabenDialog, setVorhabenDialog] = useState<{ defaults?: VorhabenDialogDefaults; editing?: Vorhaben } | null>(null);
  const [massstaebeUndGrenzenDialog, setMassstaebeUndGrenzenDialog] = useState<{ defaults?: MassstaebeUndGrenzenDialogDefaults; editing?: MassstaebeUndGrenzen } | null>(null);
  const [erkenntnisseDialog, setErkenntnisseDialog] = useState<{ defaults?: ErkenntnisseDialogDefaults; editing?: Erkenntnisse } | null>(null);
  const [entscheidungenDialog, setEntscheidungenDialog] = useState<{ defaults?: EntscheidungenDialogDefaults; editing?: Entscheidungen } | null>(null);
  const [massnahmenDialog, setMassnahmenDialog] = useState<{ defaults?: MassnahmenDialogDefaults; editing?: Massnahmen } | null>(null);
  const [erfahrungenDialog, setErfahrungenDialog] = useState<{ defaults?: ErfahrungenDialogDefaults; editing?: Erfahrungen } | null>(null);
  // „Vorhandene wählen" für den Listenfeld-Rückbezug entscheidungen.folgentraeger → beteiligte: hält die Hub-record_id.
  const [pickBeteiligteEntscheidungenFolgentraeger, setPickBeteiligteEntscheidungenFolgentraeger] = useState<string | null>(null);
  const enrichedVorhaben = useMemo(() => enrichVorhaben(data.vorhaben, { beteiligteMap: data.beteiligteMap }), [data.vorhaben, data.beteiligteMap]);
  const enrichedMassstaebeUndGrenzen = useMemo(() => enrichMassstaebeUndGrenzen(data.massstaebeUndGrenzen, { vorhabenMap: data.vorhabenMap, beteiligteMap: data.beteiligteMap }), [data.massstaebeUndGrenzen, data.vorhabenMap, data.beteiligteMap]);
  const enrichedErkenntnisse = useMemo(() => enrichErkenntnisse(data.erkenntnisse, { vorhabenMap: data.vorhabenMap, beteiligteMap: data.beteiligteMap }), [data.erkenntnisse, data.vorhabenMap, data.beteiligteMap]);
  const enrichedEntscheidungen = useMemo(() => enrichEntscheidungen(data.entscheidungen, { vorhabenMap: data.vorhabenMap, beteiligteMap: data.beteiligteMap }), [data.entscheidungen, data.vorhabenMap, data.beteiligteMap]);
  const enrichedMassnahmen = useMemo(() => enrichMassnahmen(data.massnahmen, { vorhabenMap: data.vorhabenMap, beteiligteMap: data.beteiligteMap }), [data.massnahmen, data.vorhabenMap, data.beteiligteMap]);
  const enrichedErfahrungen = useMemo(() => enrichErfahrungen(data.erfahrungen, { vorhabenMap: data.vorhabenMap, beteiligteMap: data.beteiligteMap }), [data.erfahrungen, data.vorhabenMap, data.beteiligteMap]);

  function detailBeteiligte(record: Beteiligte, push = false) {
    const item: OverlayItem = { type: 'beteiligte', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitBeteiligte(fields: Beteiligte['fields']) {
    const editing = beteiligteDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setBeteiligte(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateBeteiligteEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('beteiligte')} — ${t('crud_updated')}`, async () => {
        data.setBeteiligte(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateBeteiligteEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('beteiligte', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createBeteiligteEntry(fields);
      undoToast(`${appLabel('beteiligte')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('beteiligte', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  // Link an EXISTING Entscheidungen to the Beteiligte hub: append the hub URL to the
  // source's list field. Optimistic setter first, PATCH, undoToast counter-write.
  async function linkBeteiligteEntscheidungenFolgentraeger(sourceId: string) {
    const hub = pickBeteiligteEntscheidungenFolgentraeger;
    const src = data.entscheidungen.find(r => r.record_id === sourceId);
    if (!hub || !src) return;
    const ids = extractRecordIds(src.fields.folgentraeger);
    if (ids.includes(hub)) return;
    const next = [...ids, hub].map(id => createRecordUrl(APP_IDS.BETEILIGTE, id));
    data.setEntscheidungen(list => list.map(r => (r.record_id === sourceId ? { ...r, fields: { ...r.fields, folgentraeger: next } } : r)));
    try {
      await LivingAppsService.updateEntscheidungenEntry(sourceId, { folgentraeger: next });
    } catch (err) {
      data.fetchAll();
      throw err;
    }
    undoToast(`${appLabel('entscheidungen')} — ${t('pick_linked')}`, async () => {
      data.setEntscheidungen(list => list.map(r => (r.record_id === sourceId ? src : r)));
      try { await LivingAppsService.updateEntscheidungenEntry(sourceId, { folgentraeger: src.fields.folgentraeger }); } catch { data.fetchAll(); }
    });
  }

  function detailVorhaben(record: Vorhaben, push = false) {
    const rec = enrichedVorhaben.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'vorhaben', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitVorhaben(fields: Vorhaben['fields']) {
    const editing = vorhabenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setVorhaben(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateVorhabenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('vorhaben')} — ${t('crud_updated')}`, async () => {
        data.setVorhaben(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateVorhabenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('vorhaben', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createVorhabenEntry(fields);
      undoToast(`${appLabel('vorhaben')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('vorhaben', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  function detailMassstaebeUndGrenzen(record: MassstaebeUndGrenzen, push = false) {
    const rec = enrichedMassstaebeUndGrenzen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'massstaebeUndGrenzen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitMassstaebeUndGrenzen(fields: MassstaebeUndGrenzen['fields']) {
    const editing = massstaebeUndGrenzenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setMassstaebeUndGrenzen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateMassstaebeUndGrenzenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('massstaebe_und_grenzen')} — ${t('crud_updated')}`, async () => {
        data.setMassstaebeUndGrenzen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateMassstaebeUndGrenzenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('massstaebe_und_grenzen', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createMassstaebeUndGrenzenEntry(fields);
      undoToast(`${appLabel('massstaebe_und_grenzen')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('massstaebe_und_grenzen', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  function detailErkenntnisse(record: Erkenntnisse, push = false) {
    const rec = enrichedErkenntnisse.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erkenntnisse', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErkenntnisse(fields: Erkenntnisse['fields']) {
    const editing = erkenntnisseDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErkenntnisse(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErkenntnisseEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_updated')}`, async () => {
        data.setErkenntnisse(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErkenntnisseEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('erkenntnisse', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createErkenntnisseEntry(fields);
      undoToast(`${appLabel('erkenntnisse')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('erkenntnisse', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  function detailEntscheidungen(record: Entscheidungen, push = false) {
    const rec = enrichedEntscheidungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'entscheidungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitEntscheidungen(fields: Entscheidungen['fields']) {
    const editing = entscheidungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setEntscheidungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateEntscheidungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('entscheidungen')} — ${t('crud_updated')}`, async () => {
        data.setEntscheidungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateEntscheidungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('entscheidungen', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createEntscheidungenEntry(fields);
      undoToast(`${appLabel('entscheidungen')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('entscheidungen', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  function detailMassnahmen(record: Massnahmen, push = false) {
    const rec = enrichedMassnahmen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'massnahmen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitMassnahmen(fields: Massnahmen['fields']) {
    const editing = massnahmenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setMassnahmen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateMassnahmenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('massnahmen')} — ${t('crud_updated')}`, async () => {
        data.setMassnahmen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateMassnahmenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('massnahmen', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createMassnahmenEntry(fields);
      undoToast(`${appLabel('massnahmen')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('massnahmen', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  function detailErfahrungen(record: Erfahrungen, push = false) {
    const rec = enrichedErfahrungen.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'erfahrungen', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitErfahrungen(fields: Erfahrungen['fields']) {
    const editing = erfahrungenDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setErfahrungen(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateErfahrungenEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_updated')}`, async () => {
        data.setErfahrungen(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateErfahrungenEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
      void syncDoorsAfterWrite('erfahrungen', editing.record_id, fields as Record<string, unknown>);
    } else {
      const made = await LivingAppsService.createErfahrungenEntry(fields);
      undoToast(`${appLabel('erfahrungen')} — ${t('crud_created')}`);
      // EF-51: a new parent record gets its pair of doors right away (the record's own link)
      const madeId = (made as { id?: string; record_id?: string } | undefined)?.id ?? (made as { record_id?: string } | undefined)?.record_id;
      if (madeId) void syncDoorsAfterWrite('erfahrungen', madeId, fields as Record<string, unknown>).then(r => { if (!r.ok) toast.error(r.message ? `${t('door_failed')}: ${r.message}` : t('door_failed_later')); });
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <BeteiligteDialog
        open={beteiligteDialog !== null}
        onClose={() => setBeteiligteDialog(null)}
        onSubmit={submitBeteiligte}
        defaultValues={beteiligteDialog?.defaults}
        recordId={beteiligteDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Beteiligte']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Beteiligte']}
      />
      <VorhabenDialog
        open={vorhabenDialog !== null}
        onClose={() => setVorhabenDialog(null)}
        onSubmit={submitVorhaben}
        defaultValues={vorhabenDialog?.defaults}
        recordId={vorhabenDialog?.editing?.record_id}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Vorhaben']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Vorhaben']}
      />
      <MassstaebeUndGrenzenDialog
        open={massstaebeUndGrenzenDialog !== null}
        onClose={() => setMassstaebeUndGrenzenDialog(null)}
        onSubmit={submitMassstaebeUndGrenzen}
        defaultValues={massstaebeUndGrenzenDialog?.defaults}
        recordId={massstaebeUndGrenzenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['MassstaebeUndGrenzen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['MassstaebeUndGrenzen']}
      />
      <ErkenntnisseDialog
        open={erkenntnisseDialog !== null}
        onClose={() => setErkenntnisseDialog(null)}
        onSubmit={submitErkenntnisse}
        defaultValues={erkenntnisseDialog?.defaults}
        recordId={erkenntnisseDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Erkenntnisse']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erkenntnisse']}
      />
      <EntscheidungenDialog
        open={entscheidungenDialog !== null}
        onClose={() => setEntscheidungenDialog(null)}
        onSubmit={submitEntscheidungen}
        defaultValues={entscheidungenDialog?.defaults}
        recordId={entscheidungenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Entscheidungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Entscheidungen']}
      />
      <MassnahmenDialog
        open={massnahmenDialog !== null}
        onClose={() => setMassnahmenDialog(null)}
        onSubmit={submitMassnahmen}
        defaultValues={massnahmenDialog?.defaults}
        recordId={massnahmenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Massnahmen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Massnahmen']}
      />
      <ErfahrungenDialog
        open={erfahrungenDialog !== null}
        onClose={() => setErfahrungenDialog(null)}
        onSubmit={submitErfahrungen}
        defaultValues={erfahrungenDialog?.defaults}
        recordId={erfahrungenDialog?.editing?.record_id}
        vorhabenList={data.vorhaben}
        beteiligteList={data.beteiligte}
        enablePhotoScan={AI_PHOTO_SCAN['Erfahrungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Erfahrungen']}
      />
      <PickExistingDialog
        open={pickBeteiligteEntscheidungenFolgentraeger !== null}
        onClose={() => setPickBeteiligteEntscheidungenFolgentraeger(null)}
        title={t('pick_title', { title: appLabel('entscheidungen') })}
        items={data.entscheidungen
          .filter(r => !extractRecordIds(r.fields.folgentraeger).includes(pickBeteiligteEntscheidungenFolgentraeger ?? ''))
          .map(r => ({ id: r.record_id, label: String(displayNameOf('entscheidungen', r.fields as Record<string, unknown>) || appLabel('entscheidungen')), hint: displayPart(r.fields.datum) ? String(displayPart(r.fields.datum)) : undefined }))}
        onPick={linkBeteiligteEntscheidungenFolgentraeger}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'beteiligte') {
            return (
              <>
                <RecordHeader title={displayNameOf('beteiligte', top.record.fields as Record<string, unknown>) || appLabel('beteiligte')} subtitle={undefined} />
                <BeteiligteDetails
                  record={top.record}
                  vorhabenVerantwortlicherList={data.vorhaben}
                  onOpenVorhabenVerantwortlicher={(r) => detailVorhaben(r, true)}
                  onAddVorhabenVerantwortlicher={perms.canWrite('vorhaben') ? () => setVorhabenDialog({ defaults: { verantwortlicher: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  vorhabenVertretungList={data.vorhaben}
                  onOpenVorhabenVertretung={(r) => detailVorhaben(r, true)}
                  onAddVorhabenVertretung={perms.canWrite('vorhaben') ? () => setVorhabenDialog({ defaults: { vertretung: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  massstaebeUndGrenzenList={data.massstaebeUndGrenzen}
                  onOpenMassstaebeUndGrenzen={(r) => detailMassstaebeUndGrenzen(r, true)}
                  onAddMassstaebeUndGrenzen={perms.canWrite('massstaebe_und_grenzen') ? () => setMassstaebeUndGrenzenDialog({ defaults: { massstab_von: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { zustaendig: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  entscheidungenEntscheiderList={data.entscheidungen}
                  onOpenEntscheidungenEntscheider={(r) => detailEntscheidungen(r, true)}
                  onAddEntscheidungenEntscheider={perms.canWrite('entscheidungen') ? () => setEntscheidungenDialog({ defaults: { entscheider: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  entscheidungenFolgentraegerList={data.entscheidungen}
                  onOpenEntscheidungenFolgentraeger={(r) => detailEntscheidungen(r, true)}
                  onAddEntscheidungenFolgentraeger={perms.canWrite('entscheidungen') ? () => setEntscheidungenDialog({ defaults: { folgentraeger: [createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id)] } }) : undefined}
                  onPickEntscheidungenFolgentraeger={perms.canWrite('entscheidungen') ? () => setPickBeteiligteEntscheidungenFolgentraeger(top.record.record_id) : undefined}
                  massnahmenZustaendigList={data.massnahmen}
                  onOpenMassnahmenZustaendig={(r) => detailMassnahmen(r, true)}
                  onAddMassnahmenZustaendig={perms.canWrite('massnahmen') ? () => setMassnahmenDialog({ defaults: { zustaendig: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  massnahmenBeauftragtVonList={data.massnahmen}
                  onOpenMassnahmenBeauftragtVon={(r) => detailMassnahmen(r, true)}
                  onAddMassnahmenBeauftragtVon={perms.canWrite('massnahmen') ? () => setMassnahmenDialog({ defaults: { beauftragt_von: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { erfasser: createRecordUrl(APP_IDS.BETEILIGTE, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'vorhaben') {
            return (
              <>
                <RecordHeader title={displayNameOf('vorhaben', top.record.fields as Record<string, unknown>) || appLabel('vorhaben')} subtitle={top.record.fields.frist ? formatDate(top.record.fields.frist) : undefined} />
                <VorhabenDetails
                  record={top.record}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                  massstaebeUndGrenzenList={data.massstaebeUndGrenzen}
                  onOpenMassstaebeUndGrenzen={(r) => detailMassstaebeUndGrenzen(r, true)}
                  onAddMassstaebeUndGrenzen={perms.canWrite('massstaebe_und_grenzen') ? () => setMassstaebeUndGrenzenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  erkenntnisseList={data.erkenntnisse}
                  onOpenErkenntnisse={(r) => detailErkenntnisse(r, true)}
                  onAddErkenntnisse={perms.canWrite('erkenntnisse') ? () => setErkenntnisseDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  entscheidungenList={data.entscheidungen}
                  onOpenEntscheidungen={(r) => detailEntscheidungen(r, true)}
                  onAddEntscheidungen={perms.canWrite('entscheidungen') ? () => setEntscheidungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  massnahmenList={data.massnahmen}
                  onOpenMassnahmen={(r) => detailMassnahmen(r, true)}
                  onAddMassnahmen={perms.canWrite('massnahmen') ? () => setMassnahmenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                  erfahrungenList={data.erfahrungen}
                  onOpenErfahrungen={(r) => detailErfahrungen(r, true)}
                  onAddErfahrungen={perms.canWrite('erfahrungen') ? () => setErfahrungenDialog({ defaults: { vorhaben: createRecordUrl(APP_IDS.VORHABEN, top.record.record_id) } }) : undefined}
                />
              </>
            );
          }
          if (top.type === 'massstaebeUndGrenzen') {
            return (
              <>
                <RecordHeader title={displayNameOf('massstaebe_und_grenzen', top.record.fields as Record<string, unknown>) || appLabel('massstaebe_und_grenzen')} subtitle={undefined} />
                <MassstaebeUndGrenzenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'erkenntnisse') {
            return (
              <>
                <RecordHeader title={displayNameOf('erkenntnisse', top.record.fields as Record<string, unknown>) || appLabel('erkenntnisse')} subtitle={top.record.fields.datum ? formatDate(top.record.fields.datum) : undefined} />
                <ErkenntnisseDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'entscheidungen') {
            return (
              <>
                <RecordHeader title={displayNameOf('entscheidungen', top.record.fields as Record<string, unknown>) || appLabel('entscheidungen')} subtitle={top.record.fields.datum ? formatDate(top.record.fields.datum) : undefined} />
                <EntscheidungenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'massnahmen') {
            return (
              <>
                <RecordHeader title={displayNameOf('massnahmen', top.record.fields as Record<string, unknown>) || appLabel('massnahmen')} subtitle={top.record.fields.frist ? formatDate(top.record.fields.frist) : undefined} />
                <MassnahmenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          if (top.type === 'erfahrungen') {
            return (
              <>
                <RecordHeader title={displayNameOf('erfahrungen', top.record.fields as Record<string, unknown>) || appLabel('erfahrungen')} subtitle={top.record.fields.datum ? formatDate(top.record.fields.datum) : undefined} />
                <ErfahrungenDetails
                  record={top.record}
                  vorhabenList={data.vorhaben}
                  onOpenVorhaben={(r) => detailVorhaben(r, true)}
                  beteiligteList={data.beteiligte}
                  onOpenBeteiligte={(r) => detailBeteiligte(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        canEdit={(top) => {
          if (top.type === 'beteiligte') return perms.canWrite('beteiligte');
          if (top.type === 'vorhaben') return perms.canWrite('vorhaben');
          if (top.type === 'massstaebeUndGrenzen') return perms.canWrite('massstaebe_und_grenzen');
          if (top.type === 'erkenntnisse') return perms.canWrite('erkenntnisse');
          if (top.type === 'entscheidungen') return perms.canWrite('entscheidungen');
          if (top.type === 'massnahmen') return perms.canWrite('massnahmen');
          if (top.type === 'erfahrungen') return perms.canWrite('erfahrungen');
          return true;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'beteiligte') setBeteiligteDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'vorhaben') setVorhabenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'massstaebeUndGrenzen') setMassstaebeUndGrenzenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erkenntnisse') setErkenntnisseDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'entscheidungen') setEntscheidungenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'massnahmen') setMassnahmenDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'erfahrungen') setErfahrungenDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    beteiligte: {
      openCreate: (defaults?: BeteiligteDialogDefaults) => (perms.canWrite('beteiligte') ? setBeteiligteDialog({ defaults }) : refuse()),
      openEdit: (record: Beteiligte) => (perms.canWrite('beteiligte') ? setBeteiligteDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Beteiligte) => detailBeteiligte(record, false),
      canWrite: perms.canWrite('beteiligte'),
    },
    vorhaben: {
      openCreate: (defaults?: VorhabenDialogDefaults) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ defaults }) : refuse()),
      openEdit: (record: Vorhaben) => (perms.canWrite('vorhaben') ? setVorhabenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Vorhaben) => detailVorhaben(record, false),
      canWrite: perms.canWrite('vorhaben'),
    },
    massstaebeUndGrenzen: {
      openCreate: (defaults?: MassstaebeUndGrenzenDialogDefaults) => (perms.canWrite('massstaebe_und_grenzen') ? setMassstaebeUndGrenzenDialog({ defaults }) : refuse()),
      openEdit: (record: MassstaebeUndGrenzen) => (perms.canWrite('massstaebe_und_grenzen') ? setMassstaebeUndGrenzenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: MassstaebeUndGrenzen) => detailMassstaebeUndGrenzen(record, false),
      canWrite: perms.canWrite('massstaebe_und_grenzen'),
    },
    erkenntnisse: {
      openCreate: (defaults?: ErkenntnisseDialogDefaults) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ defaults }) : refuse()),
      openEdit: (record: Erkenntnisse) => (perms.canWrite('erkenntnisse') ? setErkenntnisseDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erkenntnisse) => detailErkenntnisse(record, false),
      canWrite: perms.canWrite('erkenntnisse'),
    },
    entscheidungen: {
      openCreate: (defaults?: EntscheidungenDialogDefaults) => (perms.canWrite('entscheidungen') ? setEntscheidungenDialog({ defaults }) : refuse()),
      openEdit: (record: Entscheidungen) => (perms.canWrite('entscheidungen') ? setEntscheidungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Entscheidungen) => detailEntscheidungen(record, false),
      canWrite: perms.canWrite('entscheidungen'),
    },
    massnahmen: {
      openCreate: (defaults?: MassnahmenDialogDefaults) => (perms.canWrite('massnahmen') ? setMassnahmenDialog({ defaults }) : refuse()),
      openEdit: (record: Massnahmen) => (perms.canWrite('massnahmen') ? setMassnahmenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Massnahmen) => detailMassnahmen(record, false),
      canWrite: perms.canWrite('massnahmen'),
    },
    erfahrungen: {
      openCreate: (defaults?: ErfahrungenDialogDefaults) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ defaults }) : refuse()),
      openEdit: (record: Erfahrungen) => (perms.canWrite('erfahrungen') ? setErfahrungenDialog({ editing: record, defaults: record.fields }) : refuse()),
      openDetail: (record: Erfahrungen) => detailErfahrungen(record, false),
      canWrite: perms.canWrite('erfahrungen'),
    },
    enriched: { beteiligte: data.beteiligte, vorhaben: enrichedVorhaben, massstaebeUndGrenzen: enrichedMassstaebeUndGrenzen, erkenntnisse: enrichedErkenntnisse, entscheidungen: enrichedEntscheidungen, massnahmen: enrichedMassnahmen, erfahrungen: enrichedErfahrungen },
  };
}
