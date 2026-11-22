/**
 * useErfahrungFesthaltenFlow — the plumbing of the flow « Erfahrung festhalten », generated from the plan.
 *
 * Writes `erfahrungen`: asks `vorhaben`, `titel`, `beschreibung`, `erkenntnis`, `empfehlung`, `erfasser`; sets `datum` itself.
 * The hook OWNS: the form(s) with exactly these fields and the plan's required
 * ingredients, one record search per picked field (columns and filter from
 * the plan), and the submit plan with its fixed and derived values. A page
 * that only calls `flow.submit.run()` cannot write a field the plan does not
 * know — there is no way to spell it.
 *
 * YOU decide what a person notices, through the options:
 *   steps     which wizard step asks which field (default: one step per pick,
 *             then one for the typed fields, then "Prüfen" = step 4)
 *   items     how a search hit is displayed per pick (title, subtitle, status …)
 *   initial   prefills for typed fields
 *   messages  the sentence for an empty required field, per field
 *
 *   const flow = useErfahrungFesthaltenFlow({
 *     steps: { vorhaben: 1, erfasser: 2, titel: 3, beschreibung: 3, erkenntnis: 3, empfehlung: 3 },
 *     items: { vorhaben: r => ({ id: r.id, title: fieldText(r, 'kennung') }) },
 *   });
 *   <IntentWizardShell forms={flow.forms} draftKey={flow.draftKey} …>
 *     <EntitySelectStep {...flow.picks.vorhaben.select} {...flow.pick('vorhaben')} />
 *     <EntitySelectStep {...flow.picks.erfasser.select} {...flow.pick('erfasser')} />
 *     <Bound form={flow.forms.erfahrungen} name="titel" />
 *     <Bound form={flow.forms.erfahrungen} name="beschreibung" />
 *     <Bound form={flow.forms.erfahrungen} name="erkenntnis" />
 *     <Bound form={flow.forms.erfahrungen} name="empfehlung" />
 *     <StepNav onNext={() => flow.validateStep(n)} />
 *     {!flow.submit.done && <SummaryStep forms={flow.formList} submit={flow.submit} />}
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
import { pickHint, whereSentence, type PickWhere } from '@/lib/journey/policy';
import { labelOf, optionsOf, type EntityKey } from '@/lib/journey/rules';
import { entityLabel } from '@/lib/journey/rules';

export type ErfahrungFesthaltenFieldKey = 'beschreibung' | 'empfehlung' | 'erfasser' | 'erkenntnis' | 'titel' | 'vorhaben';

export interface ErfahrungFesthaltenForms {
  erfahrungen: StepForm<'erfahrungen'>;
}

// Alias so the option generics stay readable.
type Key = ErfahrungFesthaltenFieldKey;

export interface ErfahrungFesthaltenFlowOptions {
  /** field → wizard step that asks it; drives „Ändern“ links and answer chips. */
  steps?: Partial<Record<Key, number>>;
  initial?: Partial<Record<Key, unknown>>;
  messages?: Partial<Record<Key, string>>;
  /** How a search hit reads — the card's title/subtitle/status per pick. */
  items?: {
    vorhaben?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
    erfasser?: (record: JourneyRecord, ctx: RefContext) => SelectItemLike;
  };
  /** A page-side narrowing per pick, on top of the plan's filter (J-3): the
   *  questions of the picked event, the open ones — `r => fieldRef(r, 'veranstaltung') === eventId`. */
  where?: {
    vorhaben?: (record: JourneyRecord) => boolean;
    erfasser?: (record: JourneyRecord) => boolean;
  };
}

const DEFAULT_STEPS: Record<string, number> = {"beschreibung": 3, "empfehlung": 3, "erfasser": 2, "erkenntnis": 3, "titel": 3, "vorhaben": 1};
export const ERFAHRUNGFESTHALTEN_REVIEW_STEP = 4;

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

export function useErfahrungFesthaltenFlow(options: ErfahrungFesthaltenFlowOptions = {}) {
  const steps = { ...DEFAULT_STEPS, ...(options.steps ?? {}) } as Record<string, number>;
  const erfahrungen = useStepForm('erfahrungen', {
    fields: ["vorhaben", "titel", "beschreibung", "erkenntnis", "empfehlung", "erfasser"],
    steps: only(steps, ["vorhaben", "titel", "beschreibung", "erkenntnis", "empfehlung", "erfasser"]) as Record<string, number>,
    initial: only(options.initial as FormValues | undefined, ["vorhaben", "titel", "beschreibung", "erkenntnis", "empfehlung", "erfasser"]),
    messages: only(options.messages as Record<string, string> | undefined, ["vorhaben", "titel", "beschreibung", "erkenntnis", "empfehlung", "erfasser"]),
  });
  const forms: ErfahrungFesthaltenForms = { erfahrungen };
  // the editor of a list is not a record of its own: the review and the success
  // page read the entries (PlanStep.review), never the half-filled editor
  const formList: StepForm[] = [erfahrungen];
  // The owner's rules after the build (intent-policies.json): a fixed value
  // for a field this flow sets itself, a narrower or wider pick — read at
  // render time, so a change works on the running application.
  usePolicyVersion();
  const searches = {
    vorhaben: useRecordSearch(servicePort, 'vorhaben', withPickPolicy('vorhaben', {
      searchFields: ["kennung", "titel"] as never,
      where: options.where?.vorhaben,
      toItem: options.items?.vorhaben as never,
      claim: 'erfahrungen.vorhaben',
    })),
    erfasser: useRecordSearch(servicePort, 'beteiligte', withPickPolicy('erfasser', {
      searchFields: ["beteiligter_lastname", "beteiligter_firstname"] as never,
      where: options.where?.erfasser,
      toItem: options.items?.erfasser as never,
      claim: 'erfahrungen.erfasser',
    })),
  };
  // Whether a pick offers „Neu anlegen“ is the plan's call: off for the record
  // this flow changes, for multi picks, for a catalogue entity and for an
  // entity with its own flow. The page spreads `.select` and writes no `create=`.
  // what the person sees under the search field: the rule that narrows the
  // pick (the owner's, else the plan's) — and the link that changes it
  const hintFor = (key: string, entity: EntityKey, planned: PickWhere | null) => pickHint(key, planned,
    w => whereSentence(w, f => labelOf(entity, f), (f, v) => optionsOf(entity, f).find(o => o.key === String(v))?.label ?? String(v)),
    `#/verwaltung/anwendung?line=intent:erfahrung-festhalten:read:${entity}`);
  const picks = {
    vorhaben: { ...searches.vorhaben, select: { ...searches.vorhaben.select, create: false as boolean, hint: hintFor('vorhaben', 'vorhaben', null as PickWhere | null) } },
    erfasser: { ...searches.erfasser, select: { ...searches.erfasser.select, create: false as boolean, hint: hintFor('erfasser', 'beteiligte', null as PickWhere | null) } },
  };

  const plan: PlanStep[] = [
    {
      key: 'erfahrungen', entity: 'erfahrungen', form: erfahrungen, label: nounOne('erfahrungen', entityLabel('erfahrungen')), primary: true,
      values: (): FormValues => ({
        datum: policyFixedValue('erfahrungen', 'datum') ?? todayIso(),
      }),
    },
  ];

  const submit = useJourneySubmit(servicePort, plan, { draftKey: 'erfahrung-festhalten', onSuccess: (r) => {
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
    { const v = linkedParams.get('titel'); if (v !== null && isEmptyValue(erfahrungen.get('titel'))) (erfahrungen.set as (k: string, v: unknown) => void)('titel', coerce(erfahrungen, 'titel', v)); }
    { const v = linkedParams.get('beschreibung'); if (v !== null && isEmptyValue(erfahrungen.get('beschreibung'))) (erfahrungen.set as (k: string, v: unknown) => void)('beschreibung', coerce(erfahrungen, 'beschreibung', v)); }
    { const v = linkedParams.get('erkenntnis'); if (v !== null && isEmptyValue(erfahrungen.get('erkenntnis'))) (erfahrungen.set as (k: string, v: unknown) => void)('erkenntnis', coerce(erfahrungen, 'erkenntnis', v)); }
    { const v = linkedParams.get('empfehlung'); if (v !== null && isEmptyValue(erfahrungen.get('empfehlung'))) (erfahrungen.set as (k: string, v: unknown) => void)('empfehlung', coerce(erfahrungen, 'empfehlung', v)); }
    {
      const cur = forms.erfahrungen.get('vorhaben');
      const fromLink = linkedParams.get('vorhaben');
      const unnamed = typeof cur === 'string' && cur !== '' && !forms.erfahrungen.labels[cur] ? cur : null;
      const id = fromLink && isEmptyValue(cur) ? fromLink : unnamed;
      if (id) void servicePort.get('vorhaben', id).then(rec => {
        if (!on || !rec) return;
        picks.vorhaben.adopt(rec);
        const name = picks.vorhaben.labelOf(rec.id) ?? rec.id;
        (forms.erfahrungen.set as (k: string, v: unknown, l?: string) => void)('vorhaben', rec.id, name);
        prefillFrom('vorhaben', rec);
      }).catch(() => undefined);
    }
    {
      const cur = forms.erfahrungen.get('erfasser');
      const fromLink = linkedParams.get('erfasser');
      const unnamed = typeof cur === 'string' && cur !== '' && !forms.erfahrungen.labels[cur] ? cur : null;
      const id = fromLink && isEmptyValue(cur) ? fromLink : unnamed;
      if (id) void servicePort.get('beteiligte', id).then(rec => {
        if (!on || !rec) return;
        picks.erfasser.adopt(rec);
        const name = picks.erfasser.labelOf(rec.id) ?? rec.id;
        (forms.erfahrungen.set as (k: string, v: unknown, l?: string) => void)('erfasser', rec.id, name);
        prefillFrom('erfasser', rec);
      }).catch(() => undefined);
    }
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per link
  }, []);

  /** Props for a single-record pick step: {...flow.picks.x.select} {...flow.pick('x')} */
  const pick = (field: ErfahrungFesthaltenFieldKey) => {
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
  const pickMany = (field: ErfahrungFesthaltenFieldKey) => {
    const owner = formList.find(f => f.keys.includes(field)) ?? formList[0];
    const search = (picks as Record<string, { labelOf(id: string): string | undefined }>)[field];
    return owner.records(field, id => search?.labelOf(id));
  };
  /** Validate every field the wizard asks in step `n` — for StepNav.onNext. */
  const validateStep = (n: number): boolean =>
    formList.every(f => f.validate(f.keys.filter(k => steps[k] === n)));
  const reset = () => { submit.reset(); formList.forEach(f => f.reset()); };

  return {
    slug: 'erfahrung-festhalten' as const,
    draftKey: 'erfahrung-festhalten' as const,    entity: 'erfahrungen' as const,
    form: erfahrungen,
    forms, formList, picks, submit, steps,    reviewStep: ERFAHRUNGFESTHALTEN_REVIEW_STEP,
    pick, pickMany, validateStep, reset,    // the door the hook reads through — for what it does not own: availability
    // (useOccupancy(flow.port, …)), a count (useRecordCount(flow.port, …)). A page
    // importing servicePort next to the hook fails gate 3 (fewo 05.10.2026: the
    // gate taught useOccupancy(servicePort, …) and forbade servicePort at once)
    port: servicePort,
  };
}

export type ErfahrungFesthaltenFlow = ReturnType<typeof useErfahrungFesthaltenFlow>;
