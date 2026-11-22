import type { Vorhaben, Beteiligte, MassstaebeUndGrenzen, Erkenntnisse, Entscheidungen, Massnahmen, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf, displayPart } from '@/lib/journey/rules';

export interface VorhabenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Vorhaben;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
  /** 1:N „Maßstäbe und Grenzen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  massstaebeUndGrenzenList: MassstaebeUndGrenzen[];
  /** Zeilen-Klick → overlay.push auf das MassstaebeUndGrenzen-Detail (nie der Edit-Dialog). */
  onOpenMassstaebeUndGrenzen: (record: MassstaebeUndGrenzen) => void;
  /** Kontextuelles „+": öffnet den MassstaebeUndGrenzen-Dialog mit diesem Record vorgesetzt. */
  onAddMassstaebeUndGrenzen?: () => void;
  /** 1:N „Erkenntnisse" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
  /** 1:N „Entscheidungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenList: Entscheidungen[];
  /** Zeilen-Klick → overlay.push auf das Entscheidungen-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungen: (record: Entscheidungen) => void;
  /** Kontextuelles „+": öffnet den Entscheidungen-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungen?: () => void;
  /** 1:N „Maßnahmen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  massnahmenList: Massnahmen[];
  /** Zeilen-Klick → overlay.push auf das Massnahmen-Detail (nie der Edit-Dialog). */
  onOpenMassnahmen: (record: Massnahmen) => void;
  /** Kontextuelles „+": öffnet den Massnahmen-Dialog mit diesem Record vorgesetzt. */
  onAddMassnahmen?: () => void;
  /** 1:N „Erfahrungen" (vorhaben): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function VorhabenDetails({
  record,
  beteiligteList,
  onOpenBeteiligte,
  massstaebeUndGrenzenList,
  onOpenMassstaebeUndGrenzen,
  onAddMassstaebeUndGrenzen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
  entscheidungenList,
  onOpenEntscheidungen,
  onAddEntscheidungen,
  massnahmenList,
  onOpenMassnahmen,
  onAddMassnahmen,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: VorhabenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const verantwortlicherTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.verantwortlicher));
  const vertretungTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.vertretung));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('vorhaben', 'kennung')} value={record.fields.kennung} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'arbeitsbereich')} value={record.fields.arbeitsbereich} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'sichtbarkeit')} value={record.fields.sichtbarkeit} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('vorhaben', 'anlass_herkunft')} value={record.fields.anlass_herkunft} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'absicht')} value={record.fields.absicht} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'absicht_art')} value={record.fields.absicht_art} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'zustand')} value={record.fields.zustand} format="pill" />
        <RecordField label={fieldLabel('vorhaben', 'frist')} value={record.fields.frist} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'wiedervorlage')} value={record.fields.wiedervorlage} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'abschlussdatum')} value={record.fields.abschlussdatum} format="date" />
        <RecordField label={fieldLabel('vorhaben', 'ergebnis')} value={record.fields.ergebnis} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'abschlussgrund')} value={record.fields.abschlussgrund} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('vorhaben', 'erwarteter_nutzen')} value={record.fields.erwarteter_nutzen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('vorhaben', 'verantwortlicher')}
          name={verantwortlicherTarget ? (displayNameOf('beteiligte', verantwortlicherTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[verantwortlicherTarget?.fields.email, verantwortlicherTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={verantwortlicherTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(verantwortlicherTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('vorhaben', 'vertretung')}
          name={vertretungTarget ? (displayNameOf('beteiligte', vertretungTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[vertretungTarget?.fields.email, vertretungTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={vertretungTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(vertretungTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('massstaebe_und_grenzen')}
        items={massstaebeUndGrenzenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: displayNameOf('massstaebe_und_grenzen', r.fields as Record<string, unknown>) || appLabel('massstaebe_und_grenzen'), meta: undefined })}
        onOpen={onOpenMassstaebeUndGrenzen}
        onAdd={onAddMassstaebeUndGrenzen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: displayNameOf('erkenntnisse', r.fields as Record<string, unknown>) || appLabel('erkenntnisse'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('entscheidungen')}
        items={entscheidungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: displayNameOf('entscheidungen', r.fields as Record<string, unknown>) || appLabel('entscheidungen'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenEntscheidungen}
        onAdd={onAddEntscheidungen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('massnahmen')}
        items={massnahmenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: displayNameOf('massnahmen', r.fields as Record<string, unknown>) || appLabel('massnahmen'), meta: displayPart(r.fields.frist) })}
        onOpen={onOpenMassnahmen}
        onAdd={onAddMassnahmen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.vorhaben) === record.record_id)}
        map={r => ({ name: displayNameOf('erfahrungen', r.fields as Record<string, unknown>) || appLabel('erfahrungen'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.VORHABEN} recordId={record.record_id} readOnly={!perms.canWrite('vorhaben')} />
    </>
  );
}
