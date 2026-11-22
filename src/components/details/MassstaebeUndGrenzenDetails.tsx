import type { MassstaebeUndGrenzen, Vorhaben, Beteiligte } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { usePermissions } from '@/lib/permissions';
import { displayNameOf } from '@/lib/journey/rules';

export interface MassstaebeUndGrenzenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: MassstaebeUndGrenzen;
  /** N:1-Ziel „Vorhaben": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  vorhabenList: Vorhaben[];
  /** Klick auf die Vorhaben-Relation → overlay.push auf dessen Detail. */
  onOpenVorhaben?: (record: Vorhaben) => void;
  /** N:1-Ziel „Beteiligte": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  beteiligteList: Beteiligte[];
  /** Klick auf die Beteiligte-Relation → overlay.push auf dessen Detail. */
  onOpenBeteiligte?: (record: Beteiligte) => void;
}

export function MassstaebeUndGrenzenDetails({
  record,
  vorhabenList,
  onOpenVorhaben,
  beteiligteList,
  onOpenBeteiligte,
}: MassstaebeUndGrenzenDetailsProps) {
  // attachments are a write to this record — read-only without the platform right
  const perms = usePermissions();
  const vorhabenTarget = vorhabenList.find(r => r.record_id === extractRecordId(record.fields.vorhaben));
  const massstab_vonTarget = beteiligteList.find(r => r.record_id === extractRecordId(record.fields.massstab_von));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('massstaebe_und_grenzen', 'art')} value={record.fields.art} format="pill" />
        <RecordField label={fieldLabel('massstaebe_und_grenzen', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('massstaebe_und_grenzen', 'vorrang')} value={record.fields.vorrang} format="bool" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('massstaebe_und_grenzen', 'vorhaben')}
          name={vorhabenTarget ? (displayNameOf('vorhaben', vorhabenTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[vorhabenTarget?.fields.kennung, vorhabenTarget?.fields.arbeitsbereich].filter(Boolean).join(' · ') || undefined}
          onClick={vorhabenTarget && onOpenVorhaben ? () => onOpenVorhaben!(vorhabenTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('massstaebe_und_grenzen', 'massstab_von')}
          name={massstab_vonTarget ? (displayNameOf('beteiligte', massstab_vonTarget.fields as Record<string, unknown>) || '—') : '—'}
          meta={[massstab_vonTarget?.fields.email, massstab_vonTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={massstab_vonTarget && onOpenBeteiligte ? () => onOpenBeteiligte!(massstab_vonTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.MASSSTAEBE_UND_GRENZEN} recordId={record.record_id} readOnly={!perms.canWrite('massstaebe_und_grenzen')} />
    </>
  );
}
