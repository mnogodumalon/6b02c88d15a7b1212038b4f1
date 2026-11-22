import type { Erkenntnisse, Vorhaben, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf } from '@/lib/journey/rules';

export interface ErkenntnisseDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Erkenntnisse;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function ErkenntnisseDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  beteiligteList,
  onOpenBeteiligte,
}: ErkenntnisseDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const zustaendigTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.zustaendig));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('erkenntnisse', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('erkenntnisse', 'herkunft')} value={record.fields.herkunft} format="text" />
        <RecordField label={fieldLabel('erkenntnisse', 'status')} value={record.fields.status} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'schutzstufe')} value={record.fields.schutzstufe} format="pill" />
        <RecordField label={fieldLabel('erkenntnisse', 'datum')} value={record.fields.datum} format="date" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'vorhaben')}
          name={vorhabenTarget ? (displayNameOf('vorhaben', vorhabenTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[vorhabenTarget?.fields.kennung, vorhabenTarget?.fields.arbeitsbereich].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('erkenntnisse', 'zustaendig')}
          name={zustaendigTarget ? (displayNameOf('beteiligte', zustaendigTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[zustaendigTarget?.fields.email, zustaendigTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={zustaendigTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(zustaendigTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ERKENNTNISSE} recordId={record.record_id} readOnly={!perms.canWrite('erkenntnisse')} />
    </>
  );
}
