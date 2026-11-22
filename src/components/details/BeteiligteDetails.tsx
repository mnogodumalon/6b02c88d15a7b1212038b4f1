import type { Beteiligte, Vorhaben, MassstaebeUndGrenzen, Erkenntnisse, Entscheidungen, Massnahmen, Erfahrungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf, displayPart } from '@/lib/journey/rules';

export interface BeteiligteDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Beteiligte;
  /** 1:N „Vorhaben" (verantwortlicher): VOLLE Liste — der Block filtert auf diesen Record. */
  vorhabenVerantwortlicherList: Vorhaben[];
  /** Zeilen-Klick → overlay.push auf das Vorhaben-Detail (nie der Edit-Dialog). */
  onOpenVorhabenVerantwortlicher: (record: Vorhaben) => void;
  /** Kontextuelles „+": öffnet den Vorhaben-Dialog mit diesem Record vorgesetzt. */
  onAddVorhabenVerantwortlicher?: () => void;
  /** 1:N „Vorhaben" (vertretung): VOLLE Liste — der Block filtert auf diesen Record. */
  vorhabenVertretungList: Vorhaben[];
  /** Zeilen-Klick → overlay.push auf das Vorhaben-Detail (nie der Edit-Dialog). */
  onOpenVorhabenVertretung: (record: Vorhaben) => void;
  /** Kontextuelles „+": öffnet den Vorhaben-Dialog mit diesem Record vorgesetzt. */
  onAddVorhabenVertretung?: () => void;
  /** 1:N „Maßstäbe und Grenzen" (massstab_von): VOLLE Liste — der Block filtert auf diesen Record. */
  massstaebeUndGrenzenList: MassstaebeUndGrenzen[];
  /** Zeilen-Klick → overlay.push auf das MassstaebeUndGrenzen-Detail (nie der Edit-Dialog). */
  onOpenMassstaebeUndGrenzen: (record: MassstaebeUndGrenzen) => void;
  /** Kontextuelles „+": öffnet den MassstaebeUndGrenzen-Dialog mit diesem Record vorgesetzt. */
  onAddMassstaebeUndGrenzen?: () => void;
  /** 1:N „Erkenntnisse" (zustaendig): VOLLE Liste — der Block filtert auf diesen Record. */
  erkenntnisseList: Erkenntnisse[];
  /** Zeilen-Klick → overlay.push auf das Erkenntnisse-Detail (nie der Edit-Dialog). */
  onOpenErkenntnisse: (record: Erkenntnisse) => void;
  /** Kontextuelles „+": öffnet den Erkenntnisse-Dialog mit diesem Record vorgesetzt. */
  onAddErkenntnisse?: () => void;
  /** 1:N „Entscheidungen" (entscheider): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenEntscheiderList: Entscheidungen[];
  /** Zeilen-Klick → overlay.push auf das Entscheidungen-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenEntscheider: (record: Entscheidungen) => void;
  /** Kontextuelles „+": öffnet den Entscheidungen-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenEntscheider?: () => void;
  /** 1:N „Entscheidungen" (folgentraeger): VOLLE Liste — der Block filtert auf diesen Record. */
  entscheidungenFolgentraegerList: Entscheidungen[];
  /** Zeilen-Klick → overlay.push auf das Entscheidungen-Detail (nie der Edit-Dialog). */
  onOpenEntscheidungenFolgentraeger: (record: Entscheidungen) => void;
  /** Kontextuelles „+": öffnet den Entscheidungen-Dialog mit diesem Record vorgesetzt. */
  onAddEntscheidungenFolgentraeger?: () => void;
  /** „Vorhandene wählen": Listenfeld-Rückbezug — hängt diesen Record an einen bestehenden Entscheidungen-Datensatz. */
  onPickEntscheidungenFolgentraeger?: () => void;
  /** 1:N „Maßnahmen" (zustaendig): VOLLE Liste — der Block filtert auf diesen Record. */
  massnahmenZustaendigList: Massnahmen[];
  /** Zeilen-Klick → overlay.push auf das Massnahmen-Detail (nie der Edit-Dialog). */
  onOpenMassnahmenZustaendig: (record: Massnahmen) => void;
  /** Kontextuelles „+": öffnet den Massnahmen-Dialog mit diesem Record vorgesetzt. */
  onAddMassnahmenZustaendig?: () => void;
  /** 1:N „Maßnahmen" (beauftragt_von): VOLLE Liste — der Block filtert auf diesen Record. */
  massnahmenBeauftragtVonList: Massnahmen[];
  /** Zeilen-Klick → overlay.push auf das Massnahmen-Detail (nie der Edit-Dialog). */
  onOpenMassnahmenBeauftragtVon: (record: Massnahmen) => void;
  /** Kontextuelles „+": öffnet den Massnahmen-Dialog mit diesem Record vorgesetzt. */
  onAddMassnahmenBeauftragtVon?: () => void;
  /** 1:N „Erfahrungen" (erfasser): VOLLE Liste — der Block filtert auf diesen Record. */
  erfahrungenList: Erfahrungen[];
  /** Zeilen-Klick → overlay.push auf das Erfahrungen-Detail (nie der Edit-Dialog). */
  onOpenErfahrungen: (record: Erfahrungen) => void;
  /** Kontextuelles „+": öffnet den Erfahrungen-Dialog mit diesem Record vorgesetzt. */
  onAddErfahrungen?: () => void;
}

export function BeteiligteDetails({
  record,
  vorhabenVerantwortlicherList,
  onOpenVorhabenVerantwortlicher,
  onAddVorhabenVerantwortlicher,
  vorhabenVertretungList,
  onOpenVorhabenVertretung,
  onAddVorhabenVertretung,
  massstaebeUndGrenzenList,
  onOpenMassstaebeUndGrenzen,
  onAddMassstaebeUndGrenzen,
  erkenntnisseList,
  onOpenErkenntnisse,
  onAddErkenntnisse,
  entscheidungenEntscheiderList,
  onOpenEntscheidungenEntscheider,
  onAddEntscheidungenEntscheider,
  entscheidungenFolgentraegerList,
  onOpenEntscheidungenFolgentraeger,
  onAddEntscheidungenFolgentraeger,
  onPickEntscheidungenFolgentraeger,
  massnahmenZustaendigList,
  onOpenMassnahmenZustaendig,
  onAddMassnahmenZustaendig,
  massnahmenBeauftragtVonList,
  onOpenMassnahmenBeauftragtVon,
  onAddMassnahmenBeauftragtVon,
  erfahrungenList,
  onOpenErfahrungen,
  onAddErfahrungen,
}: BeteiligteDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('beteiligte', 'beteiligter_lastname')} value={record.fields.beteiligter_lastname} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'email')} value={record.fields.email} format="email" />
        <RecordField label={fieldLabel('beteiligte', 'beteiligter_firstname')} value={record.fields.beteiligter_firstname} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'telefon')} value={record.fields.telefon} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'organisation')} value={record.fields.organisation} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'hat_benutzerkonto')} value={record.fields.hat_benutzerkonto} format="bool" />
        <RecordField label={fieldLabel('beteiligte', 'rolle')} value={Array.isArray(record.fields.rolle) ? record.fields.rolle.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('beteiligte', 'bemerkung')} value={record.fields.bemerkung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={`${appLabel('vorhaben')} · ${fieldLabel('vorhaben', 'verantwortlicher')}`}
        items={vorhabenVerantwortlicherList.filter(r => extractRecordId(r.fields.verantwortlicher) === record.record_id)}
        map={r => ({ name: displayNameOf('vorhaben', r.fields as Record<string, unknown>) || appLabel('vorhaben'), meta: displayPart(r.fields.frist) })}
        onOpen={onOpenVorhabenVerantwortlicher}
        onAdd={onAddVorhabenVerantwortlicher}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('vorhaben')} · ${fieldLabel('vorhaben', 'vertretung')}`}
        items={vorhabenVertretungList.filter(r => extractRecordId(r.fields.vertretung) === record.record_id)}
        map={r => ({ name: displayNameOf('vorhaben', r.fields as Record<string, unknown>) || appLabel('vorhaben'), meta: displayPart(r.fields.frist) })}
        onOpen={onOpenVorhabenVertretung}
        onAdd={onAddVorhabenVertretung}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('massstaebe_und_grenzen')}
        items={massstaebeUndGrenzenList.filter(r => extractRecordId(r.fields.massstab_von) === record.record_id)}
        map={r => ({ name: displayNameOf('massstaebe_und_grenzen', r.fields as Record<string, unknown>) || appLabel('massstaebe_und_grenzen'), meta: undefined })}
        onOpen={onOpenMassstaebeUndGrenzen}
        onAdd={onAddMassstaebeUndGrenzen}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erkenntnisse')}
        items={erkenntnisseList.filter(r => extractRecordId(r.fields.zustaendig) === record.record_id)}
        map={r => ({ name: displayNameOf('erkenntnisse', r.fields as Record<string, unknown>) || appLabel('erkenntnisse'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenErkenntnisse}
        onAdd={onAddErkenntnisse}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('entscheidungen')} · ${fieldLabel('entscheidungen', 'entscheider')}`}
        items={entscheidungenEntscheiderList.filter(r => extractRecordId(r.fields.entscheider) === record.record_id)}
        map={r => ({ name: displayNameOf('entscheidungen', r.fields as Record<string, unknown>) || appLabel('entscheidungen'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenEntscheidungenEntscheider}
        onAdd={onAddEntscheidungenEntscheider}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('entscheidungen')} · ${fieldLabel('entscheidungen', 'folgentraeger')}`}
        items={entscheidungenFolgentraegerList.filter(r => Array.isArray(r.fields.folgentraeger) && r.fields.folgentraeger.some((u: unknown) => extractRecordId(u) === record.record_id))}
        map={r => ({ name: displayNameOf('entscheidungen', r.fields as Record<string, unknown>) || appLabel('entscheidungen'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenEntscheidungenFolgentraeger}
        onAdd={onAddEntscheidungenFolgentraeger}
        onPick={onPickEntscheidungenFolgentraeger}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('massnahmen')} · ${fieldLabel('massnahmen', 'zustaendig')}`}
        items={massnahmenZustaendigList.filter(r => extractRecordId(r.fields.zustaendig) === record.record_id)}
        map={r => ({ name: displayNameOf('massnahmen', r.fields as Record<string, unknown>) || appLabel('massnahmen'), meta: displayPart(r.fields.frist) })}
        onOpen={onOpenMassnahmenZustaendig}
        onAdd={onAddMassnahmenZustaendig}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={`${appLabel('massnahmen')} · ${fieldLabel('massnahmen', 'beauftragt_von')}`}
        items={massnahmenBeauftragtVonList.filter(r => extractRecordId(r.fields.beauftragt_von) === record.record_id)}
        map={r => ({ name: displayNameOf('massnahmen', r.fields as Record<string, unknown>) || appLabel('massnahmen'), meta: displayPart(r.fields.frist) })}
        onOpen={onOpenMassnahmenBeauftragtVon}
        onAdd={onAddMassnahmenBeauftragtVon}
        getKey={r => r.record_id}
      />

      <SatelliteSection
        title={appLabel('erfahrungen')}
        items={erfahrungenList.filter(r => extractRecordId(r.fields.erfasser) === record.record_id)}
        map={r => ({ name: displayNameOf('erfahrungen', r.fields as Record<string, unknown>) || appLabel('erfahrungen'), meta: displayPart(r.fields.datum) })}
        onOpen={onOpenErfahrungen}
        onAdd={onAddErfahrungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.BETEILIGTE} recordId={record.record_id} readOnly={!perms.canWrite('beteiligte')} />
    </>
  );
}
