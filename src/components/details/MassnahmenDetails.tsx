import type { Massnahmen, Vorhaben, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf } from '@/lib/journey/rules';

export interface MassnahmenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Massnahmen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function MassnahmenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  beteiligteList,
  onOpenBeteiligte,
}: MassnahmenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const zustaendigTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.zustaendig));
  const beauftragt_vonTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.beauftragt_von));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('massnahmen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('massnahmen', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('massnahmen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('massnahmen', 'frist')} value={record.fields.frist} format="date" />
        <RecordField label={fieldLabel('massnahmen', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('massnahmen', 'ausfuehrungsdatum')} value={record.fields.ausfuehrungsdatum} format="datetime" />
        <RecordField label={fieldLabel('massnahmen', 'ergebnis')} value={record.fields.ergebnis} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('massnahmen', 'vorhaben')}
          name={vorhabenTarget ? (displayNameOf('vorhaben', vorhabenTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[vorhabenTarget?.fields.kennung, vorhabenTarget?.fields.arbeitsbereich].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('massnahmen', 'zustaendig')}
          name={zustaendigTarget ? (displayNameOf('beteiligte', zustaendigTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[zustaendigTarget?.fields.email, zustaendigTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={zustaendigTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(zustaendigTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('massnahmen', 'beauftragt_von')}
          name={beauftragt_vonTarget ? (displayNameOf('beteiligte', beauftragt_vonTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[beauftragt_vonTarget?.fields.email, beauftragt_vonTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={beauftragt_vonTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(beauftragt_vonTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.MASSNAHMEN} recordId={record.record_id} readOnly={!perms.canWrite('massnahmen')} />
    </>
  );
}
