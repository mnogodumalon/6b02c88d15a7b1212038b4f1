import { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import { IconAlertTriangle, IconPlus, IconRocket } from '@tabler/icons-react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { flowActionFor } from '@/config/plan';
import { LOOKUP_OPTIONS } from '@/types/app';
import { lookupKey, formatDate } from '@/lib/formatters';
import { tx, appLabel } from '@/i18n';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { Button } from '@/components/ui/button';
import { KanbanWidget, type KanbanCard } from '@/components/widgets/KanbanWidget';
import type { EnrichedVorhaben } from '@/types/enriched';

type Filter = 'all' | 'frist' | 'wv' | 'unvollstaendig';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { vorhaben } = data;
  const clock = useClock();
  const [filter, setFilter] = useState<Filter>('all');

  // Next workflow step of a Vorhaben — always goes through its flow (the flow owns zustand).
  const nextStep = (r: EnrichedVorhaben): { label: string; go: (() => void) | null } | null => {
    const z = lookupKey(r.fields.zustand);
    const to = z === 'entwurf' ? 'aktiv' : z === 'aktiv' ? 'beendet' : z === 'ruhend' ? 'aktiv' : null;
    if (!to) return null;
    const label = to === 'beendet' ? tx('Beenden') : to === 'aktiv' && z === 'ruhend' ? tx('Wieder aufnehmen') : tx('Aktivieren');
    return { label, go: flowActionFor('vorhaben', 'zustand', r.record_id, to) };
  };

  const crud = useEntityCrud(data, {
    footer: (top) => {
      if (top.type !== 'vorhaben') return undefined;
      const s = nextStep(top.record as EnrichedVorhaben);
      return s?.go ? { label: s.label, onClick: s.go } : undefined;
    },
  });
  const enrichedVorhaben = crud.enriched.vorhaben;
  const enrichedMassnahmen = crud.enriched.massnahmen;
  const enrichedErkenntnisse = crud.enriched.erkenntnisse;
  const enrichedEntscheidungen = crud.enriched.entscheidungen;

  const today = format(clock, 'yyyy-MM-dd');
  const soon = format(addDays(clock, 14), 'yyyy-MM-dd');
  const day = (s?: string) => (s ? s.slice(0, 10) : '');

  const calc = useMemo(() => {
    const open = enrichedVorhaben.filter(v => lookupKey(v.fields.zustand) !== 'beendet');
    const unowned = open.filter(v => !v.fields.verantwortlicher);
    const fristNah = enrichedVorhaben.filter(v => lookupKey(v.fields.zustand) === 'aktiv' && day(v.fields.frist) && day(v.fields.frist) <= soon);
    const wvDue = open.filter(v => day(v.fields.wiedervorlage) && day(v.fields.wiedervorlage) <= today);
    const unvollstaendig = enrichedVorhaben.filter(v => lookupKey(v.fields.zustand) === 'beendet' && (!v.fields.ergebnis?.trim() || !v.fields.abschlussgrund?.trim()));
    return { open, unowned, fristNah, wvDue, unvollstaendig };
  }, [enrichedVorhaben, today, soon]);

  const titelOf = (v: EnrichedVorhaben) => v.fields.titel || v.fields.kennung || appLabel('vorhaben');

  const dueSoon = useMemo(() => {
    const ids = new Set([...calc.fristNah, ...calc.wvDue].map(v => v.record_id));
    const earliest = (v: EnrichedVorhaben) => [day(v.fields.frist), day(v.fields.wiedervorlage)].filter(Boolean).sort()[0] ?? '9999';
    return enrichedVorhaben.filter(v => ids.has(v.record_id)).sort((a, b) => earliest(a).localeCompare(earliest(b)));
  }, [calc, enrichedVorhaben]);

  const offeneMassnahmen = useMemo(() => enrichedMassnahmen
    .filter(m => { const k = lookupKey(m.fields.status); return k !== 'erledigt' && k !== 'verworfen'; })
    .sort((a, b) => (day(a.fields.frist) || '9999').localeCompare(day(b.fields.frist) || '9999')), [enrichedMassnahmen]);
  const alleMassnahmen = enrichedMassnahmen.filter(m => lookupKey(m.fields.status) !== 'verworfen').length;

  const beantragt = enrichedEntscheidungen.filter(e => lookupKey(e.fields.status) === 'beantragt');
  const offeneFragen = enrichedErkenntnisse.filter(e => {
    const art = lookupKey(e.fields.art);
    return lookupKey(e.fields.status) === 'offen' && (art === 'fallfrage' || art === 'einwand');
  });

  const columns = (LOOKUP_OPTIONS['vorhaben']?.['zustand'] ?? []).map(o => ({ key: o.key, label: o.label }));
  const shown = filter === 'frist' ? calc.fristNah : filter === 'wv' ? calc.wvDue : filter === 'unvollstaendig' ? calc.unvollstaendig : enrichedVorhaben;
  const cards: KanbanCard[] = [...shown]
    .sort((a, b) => (day(a.fields.frist) || '9999').localeCompare(day(b.fields.frist) || '9999'))
    .map(v => {
      const incomplete = calc.unvollstaendig.includes(v);
      const parts = [
        v.verantwortlicherName || tx('ohne Verantwortung'),
        v.fields.frist ? tx`Frist ${formatDate(v.fields.frist)}` : '',
        incomplete ? tx('Ergebnis/Abschlussgrund fehlt') : '',
      ].filter(Boolean);
      return {
        id: `vorhaben:${v.record_id}`,
        column: lookupKey(v.fields.zustand) ?? '',
        title: titelOf(v),
        subtitle: parts.join(' · '),
        tone: incomplete ? 'warning' : 'default',
      } as KanbanCard;
    });

  const openVorhaben = (id: string) => {
    const r = vorhaben.find(v => v.record_id === id);
    if (r) crud.vorhaben.openDetail(r);
  };
  const toggle = (f: Filter) => setFilter(cur => (cur === f ? 'all' : f));

  const vorhabenAction = (v: EnrichedVorhaben) => {
    const s = nextStep(v);
    return s?.go ? { label: s.label, onClick: s.go } : { label: tx('Bearbeiten'), onClick: () => crud.vorhaben.openEdit(v) };
  };

  const dueWord = (d: string) => d < today
    ? <span className="font-medium text-destructive">{tx('Überfällig')}</span>
    : d === today
      ? <span className="font-medium text-amber-600">{tx('Heute')}</span>
      : <span className="font-medium text-muted-foreground">{tx('Bald')}</span>;

  // context line — names things in every branch
  const context = (() => {
    if (enrichedVorhaben.length === 0) return tx('Lege dein erstes Vorhaben an und halte fest, worum es geht.');
    if (calc.unowned.length > 0) return tx`${namen(calc.unowned.map(titelOf))} braucht noch eine verantwortliche Person.`;
    if (calc.wvDue.length > 0) return tx`Wiedervorlage fällig: ${namen(calc.wvDue.map(titelOf))}.`;
    if (calc.fristNah.length > 0) return tx`Bald fällig: ${namen(calc.fristNah.map(titelOf))}.`;
    if (calc.open.length > 0) return tx`Alles im Plan — aktuell laufen ${namen(calc.open.map(titelOf))}.`;
    return tx('Alle Vorhaben sind beendet.');
  })();

  const hero = enrichedVorhaben.length === 0
    ? (
      <HeroBanner icon={<IconRocket size={18} />} action={{ label: tx('Erstes Vorhaben anlegen'), onClick: () => crud.vorhaben.openCreate({ zustand: 'entwurf' }) }}>
        {tx('Noch kein Vorhaben vorhanden — starte mit einem Anlass und einer Absicht.')}
      </HeroBanner>
    )
    : calc.unowned.length > 0
      ? (
        <HeroBanner icon={<IconAlertTriangle size={18} />} action={{ label: tx('Verantwortung festlegen'), onClick: () => crud.vorhaben.openEdit(calc.unowned[0]) }}>
          <b>{namen(calc.unowned.map(titelOf))}</b> {tx('hat keine verantwortliche Person — vor gemeinsamer Arbeit klären.')}
        </HeroBanner>
      )
      : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{gruss(clock)}</h1>
          <p className="text-sm text-muted-foreground">{context}</p>
        </div>
        {crud.vorhaben.canWrite && (
          <Button onClick={() => crud.vorhaben.openCreate({ zustand: 'entwurf' })}>
            <IconPlus size={16} className="shrink-0" />
            <span className="ml-1">{tx('Neues Vorhaben')}</span>
          </Button>
        )}
      </div>

      <DashboardGrid
        variant="wide"
        hero={hero}
        kpis={enrichedVorhaben.length > 0 ? (
          <StatStrip>
            <StatStripItem
              title={tx('Frist in 14 Tagen')}
              value={calc.fristNah.length}
              tone={calc.fristNah.length > 0 ? 'warning' : 'default'}
              onClick={() => toggle('frist')}
              active={filter === 'frist'}
            />
            <StatStripItem
              title={tx('Wiedervorlage fällig')}
              value={calc.wvDue.length}
              tone={calc.wvDue.length > 0 ? 'warning' : 'default'}
              onClick={() => toggle('wv')}
              active={filter === 'wv'}
            />
            <StatStripItem
              title={tx('Beendet, unvollständig')}
              value={calc.unvollstaendig.length}
              tone={calc.unvollstaendig.length > 0 ? 'destructive' : 'default'}
              onClick={() => toggle('unvollstaendig')}
              active={filter === 'unvollstaendig'}
            />
            <StatStripItem
              title={tx('Maßnahmen offen')}
              value={`${offeneMassnahmen.length}/${alleMassnahmen}`}
            />
          </StatStrip>
        ) : undefined}
        primary={(
          <KanbanWidget
            cards={cards}
            columns={columns}
            defaultCollapsed={['beendet']}
            onCardClick={c => openVorhaben(c.id.split(':')[1])}
            onCardMove={(id, col) => {
              const go = flowActionFor('vorhaben', 'zustand', id.split(':')[1], col);
              if (go) { go(); undoToast(tx('Ablauf für den Zustandswechsel geöffnet')); return; }
              return tx('Dieser Zustandswechsel ist nur über den Ablauf möglich');
            }}
            onAddCard={crud.vorhaben.canWrite ? (col) => crud.vorhaben.openCreate({ zustand: col }) : undefined}
          />
        )}
        aside={(
          <>
            <WorkList
              title={tx('Fristen & Wiedervorlagen')}
              items={dueSoon.map(v => {
                const wv = day(v.fields.wiedervorlage);
                const fr = day(v.fields.frist);
                const isWv = !!wv && wv <= today;
                const d = isWv ? wv : fr;
                return {
                  id: v.record_id,
                  title: titelOf(v),
                  secondLine: (
                    <>
                      {dueWord(d)}
                      <span className="text-muted-foreground"> · {isWv ? tx('Wiedervorlage') : tx('Frist')} {formatDate(d)}</span>
                    </>
                  ),
                  action: vorhabenAction(v),
                };
              })}
              onItemClick={openVorhaben}
              empty={{ text: tx('Keine Frist oder Wiedervorlage in den nächsten 14 Tagen.') }}
            />
            <WorkList
              title={tx('Offene Maßnahmen')}
              items={offeneMassnahmen.map(m => {
                const fr = day(m.fields.frist);
                return {
                  id: m.record_id,
                  title: m.fields.titel || appLabel('massnahmen'),
                  secondLine: (
                    <>
                      {fr ? dueWord(fr <= today ? fr : '9999') : <span className="text-muted-foreground">{m.fields.status?.label}</span>}
                      <span className="text-muted-foreground"> · {m.vorhabenName}{fr ? ` · ${formatDate(fr)}` : ''}</span>
                    </>
                  ),
                  action: { label: tx('Bearbeiten'), onClick: () => crud.massnahmen.openEdit(m) },
                };
              })}
              onItemClick={id => { const r = enrichedMassnahmen.find(m => m.record_id === id); if (r) crud.massnahmen.openDetail(r); }}
              empty={{ text: tx('Keine offenen Maßnahmen.') }}
            />
            <WorkList
              title={tx('Beantragte Entscheidungen & Freigaben')}
              items={beantragt.map(e => ({
                id: e.record_id,
                title: e.fields.gegenstand || appLabel('entscheidungen'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {e.fields.art?.label} · {e.vorhabenName}{e.entscheiderName ? ` · ${e.entscheiderName}` : ''}
                  </span>
                ),
                action: { label: tx('Bearbeiten'), onClick: () => crud.entscheidungen.openEdit(e) },
              }))}
              onItemClick={id => { const r = enrichedEntscheidungen.find(e => e.record_id === id); if (r) crud.entscheidungen.openDetail(r); }}
              empty={{ text: tx('Nichts wartet auf Entscheidung.') }}
            />
            <WorkList
              title={tx('Offene Fallfragen & Einwände')}
              items={offeneFragen.map(e => ({
                id: e.record_id,
                title: e.fields.titel || appLabel('erkenntnisse'),
                secondLine: (
                  <span className="text-muted-foreground">
                    {e.fields.art?.label} · {e.vorhabenName}{e.zustaendigName ? ` · ${e.zustaendigName}` : ''}
                  </span>
                ),
                action: { label: tx('Bearbeiten'), onClick: () => crud.erkenntnisse.openEdit(e) },
              }))}
              onItemClick={id => { const r = enrichedErkenntnisse.find(e => e.record_id === id); if (r) crud.erkenntnisse.openDetail(r); }}
              empty={{ text: tx('Keine offenen Fallfragen oder Einwände.') }}
            />
          </>
        )}
      />
      {crud.surfaces}
    </div>
  );
}
