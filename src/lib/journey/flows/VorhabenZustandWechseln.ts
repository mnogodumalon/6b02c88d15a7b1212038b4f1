/**
 * useVorhabenZustandWechselnFlow — the plumbing of the flow « Zustand wechseln », generated from the plan.
 *
 * Changes `vorhaben`: the record to change is picked (`flow.pick('vorhaben')`), the form is prefilled with its values; asks `zustand`.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 3)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useVorhabenZustandWechselnFlow({
 *     steps: { vorhaben: 1, zustand: 2 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'kennung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     // the record this flow changes: <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <Bound form={flow.forms.vorhaben} name="zustand" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} variants={flow.actions} />}
 *     {flow.submit.result && <SuccessStep result={flow.submit.result} forms={flow.formList} submit={flow.submit} />}
 *   </IntentWizardShell>
 */
import { useEffect, useRef, useState } from 'react';
import { readJourneyExtra, writeJourneyExtra } from '@/lib/journey/draft';
import { DOOR_PARENTS, nounOne } from '@/config/plan';
import { syncDoorsAfterWrite } from '@/lib/publicDoors';
import {
  useStepForm, useJourneySubmit, useRecordSearch,
  fieldText, fieldLookup, fieldLookups, fieldNumber, fieldDate, fieldRef,
  todayIso, nowIso, isEmptyValue, policyFixedValue, withPickPolicy, usePolicyVersion,  type StepForm, type JourneyRecord, type RefContext, type SelectItemLike, type FormValues, type PlanStep,} from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { requestWizardStep } from '@/lib/journey/useStepForm';
import { reportReadFailure } from '@/lib/journey/readFailures';
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';

export type VorhabenZustandWechselnFieldKey = 'vorhaben' | 'zustand';

export interface VorhabenZustandWechselnForms {
  vorhaben: StepForm<'vorhaben'>;
}

// Alias so the option generics stay readable.
type Key = VorhabenZustandWechselnFieldKey;

export interface VorhabenZustandWechselnFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
  /** A page-side narrowing per pick, on top of the plan's filter (J-3): the
   *  questions of the picked event, the open ones — `r => fieldRef(r, 'veranstaltung') === eventId`. */
  where?: {
    vorhaben?: (record: JourneyRecord) => boolean;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"vorhaben": 1, "zustand": 2};
export const VORHABENZUSTANDWECHSELN_REVIEW_STEP = 3;
// a label of the plan in the page's language
function labelIn(m: Record<string, string>): string {
  const l = (typeof document !== 'undefined' ? document.documentElement.lang : '') || 'de';
  return m[l.slice(0, 2)] ?? m.de ?? Object.values(m)[0] ?? '';
}
// the ways this flow may END (plan: success.actions) — the review shows one
// button per entry, the chosen one sets these values on the primary record
const ACTION_SETS: Record<string, FormValues> = { 'aktivieren': {"zustand": "aktiv"}, 'ruhend-setzen': {"zustand": "ruhend"}, 'als-entwurf-zurueck': {"zustand": "entwurf"} };

function fromPick<T>(pick: { recordOf(id: string): JourneyRecord | undefined }, form: StepForm, field: string, read: (r: JourneyRecord) => T): T | undefined {
  const id = form.get(field);
  const rec = typeof id === 'string' && id ? pick.recordOf(id) : undefined;
  return rec ? read(rec) : undefined;
}
// local calendar day — the ISO-string of a Date is UTC and flips the date in the evening (J-7)
function isoDaysFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns T, not Partial<T>: a Record's index signature is already "maybe
// absent", and Partial<Record<string, string>> does not assign to the
// Record<string, string> useStepForm wants (tsc, live 23.09.2026 — eight
// errors, one per hook, caught only in the sandbox build).
function only<T extends Record<string, unknown>>(obj: T | undefined, keys: string[]): T | undefined {
  if (!obj) return undefined;
  const out: Record<string, unknown> = {};
  for (const k of keys) if (k in obj) out[k] = obj[k];
  return out as T;
}

function hasValues(form: StepForm): boolean {
  return form.keys.some(k => !isEmptyValue(form.values[k]));
}
// The picked record as `?record=<id>` in the address — a reload or a shared
// address opens the flow on the same record (J-8). replaceState: no navigation.
function mirrorRecordParam(id: string | null): void {
  try {
    const [base, query = ''] = window.location.hash.split('?');
    const q = new URLSearchParams(query);
    if (id) q.set('record', id); else q.delete('record');
    const qs = q.toString();
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${base}${qs ? `?${qs}` : ''}`);
  } catch {
    /* ignore */
  }
}

export function useVorhabenZustandWechselnFlow(options: VorhabenZustandWechselnFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const variantRef = useRef<string | null>(null);   // the end action the person chose (PV-14)
  const [vorhabenTargetId, setVorhabenTargetId] = useState<string | null>(null);
  const vorhaben = useStepForm('vorhaben', {
    fields: ["zustand"],
    steps: only(steps, ["zustand"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["zustand"]),
    messages: only(options.messages as Record<string, string> | undefined, ["zustand"]),
  });
  const forms: VorhabenZustandWechselnForms = { vorhaben };
  // the editor of a list is not a record of its own: the review and the success
  // page read the entries (PlanStep.review), never the half-filled editor
  const formList: StepForm[] = [vorhaben];
  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["kennung", "titel"] as never,
      filter: "r.v_zustand in ['entwurf', 'aktiv', 'ruhend']",
      where: (r: JourneyRecord) => (["entwurf", "aktiv", "ruhend"].includes(fieldLookup(r, "zustand")?.key ?? '')) && (options.where?.vorhaben?.(r) ?? true),
      toItem: options.items?.vorhaben as never,
      includeTaken: true,
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:vorhaben-zustand-wechseln:read:${entity}`);
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: false as boolean, hint: hintFor('vorhaben', 'vorhaben', {"conditions": [{"field": "zustand", "op": "in", "value": ["entwurf", "aktiv", "ruhend"]}], "mode": "all"} as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'vorhaben', entity: 'vorhaben', form: vorhaben, label: nounOne('vorhaben', entityLabel('vorhaben')), primary: true,
      updates: () => vorhabenTargetId ?? undefined,
      // the review names the record this step changes; "Ändern" leads back to its pick
      target: () => vorhabenTargetId
        ? { key: 'target:vorhaben', label: nounOne('vorhaben', entityLabel('vorhaben')), value: picks.vorhaben.labelOf(vorhabenTargetId) ?? vorhabenTargetId, step: steps.vorhaben }
        : undefined,
      values: (): FormValues => ({
        ...(variantRef.current ? ACTION_SETS[variantRef.current] ?? {} : {}),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'vorhaben-zustand-wechseln', onSuccess: (r) => {
    // EF-51: a created or changed parent record keeps its pair of doors in step (made, closed, reopened)
    for (const [k, rec] of Object.entries(r.records)) {
      const ent = plan.find(s => s.key === k)?.entity;
      if (ent && Object.values(DOOR_PARENTS).some(d => d.entity === ent)) void syncDoorsAfterWrite(ent, rec.id, rec.fields);
    }
  } });

  // A typed field the plan prefills from the picked record (`user:from_pick`),
  // still the person's to change: filled once, only while empty (PV-12)
  const prefillFrom = (pickKey: string, rec: JourneyRecord) => {
    void pickKey; void rec;
  };

  // Opened with `?<field>=<value>` for a field this flow asks — a dashboard
  // link that pre-picks the event, a form that hands the question on (J-2):
  // a typed field takes the value while it is empty (a draft wins), a pick
  // loads the record, takes it into the pick and selects it WITH its name.
  // `initial` with a bare record id gets its name the same way.
  const [linkedParams] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? ''));
  useEffect(() => {
    let on = true;
    const coerce = (form: StepForm, key: string, raw: string): unknown => {
      const kind = form.rules[key]?.kind;
      if (kind === 'number') { const n = Number(raw); return Number.isFinite(n) ? n : raw; }
      if (kind === 'bool') return raw === 'true' || raw === '1' || raw === 'ja';
      return raw;
    };
    { const v = linkedParams.get('zustand'); if (v !== null && isEmptyValue(vorhaben.get('zustand'))) (vorhaben.set as (k: string, v: unknown) => void)('zustand', coerce(vorhaben, 'zustand', v)); }
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per link
  }, []);

  /** The record(s) this flow CHANGES: picked through {...flow.picks.<entity>.select} {...flow.pick('<entity>')};
   *  picking prefills the form with the record's current values, and the plan step updates that record. */
  const targets = {
    vorhaben: {
      selectedId: vorhabenTargetId,
      onSelect: (id: string) => {
        setVorhabenTargetId(id);
        const rec = picks.vorhaben.recordOf(id);
        if (rec) vorhaben.reset({ zustand: fieldLookup(rec, "zustand")?.key, });
        // survives a reload: in the draft's side data, and as `?record=` in the address (J-8)
        writeJourneyExtra('vorhaben-zustand-wechseln', 'target:vorhaben', id);
        mirrorRecordParam(id);
      },
      get record(): JourneyRecord | undefined { return vorhabenTargetId ? picks.vorhaben.recordOf(vorhabenTargetId) : undefined; },
    },
  };
  // Opened for one record — `#/intents/vorhaben-zustand-wechseln?record=<id>`, the dashboard's
  // flowActionFor(): that record is the one to change. Loaded, taken into the
  // pick and selected — when this flow may change it at all (the pick's rule).
  // After a reload the pick comes back the same way: from the address, else
  // from the draft's side data (J-8).
  const [linkedId] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('record')
    ?? readJourneyExtra<string>('vorhaben-zustand-wechseln', 'target:vorhaben'));
  useEffect(() => {
    if (!linkedId) return;
    let on = true;
    void servicePort.get('vorhaben', linkedId).then(rec => {
      if (!on || !rec || !((r: JourneyRecord) => ["entwurf", "aktiv", "ruhend"].includes(fieldLookup(r, "zustand")?.key ?? ''))(rec)) return;
      reportReadFailure('vorhaben-zustand-wechseln:linked', null);
      picks.vorhaben.adopt(rec);
      targets.vorhaben.onSelect(rec.id);
      // the link named the record — start after the steps that pick it, without the start screen
      const after = Math.max(...Object.keys(targets).map(k => steps[k] ?? 1)) + 1;
      if (new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('record') === linkedId) requestWizardStep(after);
    }).catch(() => { if (on) reportReadFailure('vorhaben-zustand-wechseln:linked', 'vorhaben'); });
    return () => { on = false; reportReadFailure('vorhaben-zustand-wechseln:linked', null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per link
  }, [linkedId]);
  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: VorhabenZustandWechselnFieldKey) => {
    if (field in targets) {
      const t = targets[field as keyof typeof targets];
      return { selectedId: t.selectedId, onSelect: t.onSelect };
    }
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined; recordOf?(id: string): JourneyRecord | undefined }>)[field];
    return {
      selectedId: (typeof owner.get(field) === 'string' ? (owner.get(field) as string) : null) || null,
      // `field as never` collapsed the conditional SetArgs<E, never> to never and
      // no argument was assignable any more (tsc, live 23.09.2026); widen `set`
      // itself instead — the label stays a required third argument.
      onSelect: (id: string) => {
        (owner.set as (k: string, v: unknown, l?: string) => void)(field, id, search?.labelOf(id));
        const rec = search?.recordOf?.(id);
        if (rec) prefillFrom(field, rec);
      },
    };
  };
  /** Props for a multi-record pick step: {...flow.picks.x.select} {...flow.pickMany('x')} */
  const pickMany = (field: VorhabenZustandWechselnFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)))    && Object.entries(targets).every(([k, t]) => steps[k] !== n || !!t.selectedId);
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); setVorhabenTargetId(null); writeJourneyExtra('vorhaben-zustand-wechseln', 'target:vorhaben', null); mirrorRecordParam(null); };

  /** The ways this flow may end — spread as `variants={flow.actions}` onto <SummaryStep> (PV-14). */
  const flowActions = [
    { id: 'aktivieren', label: labelIn({"de": "Aktivieren", "en": "Activate"}), confirm: () => { variantRef.current = 'aktivieren'; return submit.run(); } },
    { id: 'ruhend-setzen', label: labelIn({"de": "Ruhend setzen", "en": "Set to dormant"}), confirm: () => { variantRef.current = 'ruhend-setzen'; return submit.run(); } },
    { id: 'als-entwurf-zurueck', label: labelIn({"de": "Als Entwurf zur\u00fccksetzen", "en": "Reset to draft"}), confirm: () => { variantRef.current = 'als-entwurf-zurueck'; return submit.run(); } },
  ];
  return {
    slug: 'vorhaben-zustand-wechseln' as const,
    draftKey: 'vorhaben-zustand-wechseln' as const,    actions: flowActions,    entity: 'vorhaben' as const,
    form: vorhaben,
    forms, formList, picks, submit, steps, targets,    reviewStep: VORHABENZUSTANDWECHSELN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type VorhabenZustandWechselnFlow = ReturnType<typeof useVorhabenZustandWechselnFlow>;
