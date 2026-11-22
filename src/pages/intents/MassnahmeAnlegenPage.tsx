/**
 * Maßnahme anlegen — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Mehrere Maßnahmen mit Art, Titel, Beschreibung und Frist erfassen
 *        → 3) Zuständige und beauftragende Person wählen → 4) Prüfen & anlegen.
 * Reads: vorhaben, beteiligte. Writes: massnahmen (one record per entry, via useMassnahmeAnlegenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, ListEntries, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { ListEntries } from '@/components/blocks/ListEntries';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useMassnahmeAnlegenFlow } from '@/lib/journey/flows/MassnahmeAnlegen';
import { tx } from '@/i18n';

export default function MassnahmeAnlegenPage() {
  const [step, setStep] = useState(1);
  const flow = useMassnahmeAnlegenFlow({
    steps: { vorhaben: 1, art: 2, titel: 2, beschreibung: 2, frist: 2, zustaendig: 3, beauftragt_von: 3 },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel') || fieldText(r, 'kennung'),
        subtitle: fieldText(r, 'kennung'),
      }),
      zustaendig: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
      }),
      beauftragt_von: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
      }),
    },
  });

  const pickLabel = (key: 'vorhaben' | 'zustaendig' | 'beauftragt_von') => {
    const id = flow.forms.massnahmen.get(key);
    return typeof id === 'string' && id ? flow.picks[key].labelOf(id) ?? '—' : '—';
  };

  const fristen =
    flow.lists.massnahmen.entries
      .map(e => (typeof e.values.frist === 'string' && e.values.frist ? e.values.frist : null))
      .filter((v): v is string => Boolean(v))
      .join(', ') || '—';

  return (
    <IntentWizardShell
      title={tx('Maßnahme anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lege eine oder mehrere Maßnahmen zu einem Vorhaben an.'),
        needs: [tx('Das Vorhaben'), tx('Titel der Maßnahmen'), tx('Zuständige und beauftragende Person')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehören die Maßnahmen?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel oder Kennung …')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Maßnahmen')}
        description={tx('Erfasse jede Maßnahme mit Art, Titel, Beschreibung und Frist.')}
        needs={['vorhaben']}
      >
        <ListEntries list={flow.lists.massnahmen}>
          <Bound form={flow.forms.massnahmen} name="art" />
          <Bound form={flow.forms.massnahmen} name="titel" />
          <Bound form={flow.forms.massnahmen} name="beschreibung" rows={3} />
          <Bound form={flow.forms.massnahmen} name="frist" />
        </ListEntries>
        <StepNav
          onBack={() => setStep(1)}
          onNext={() => flow.validateStep(2)}
          nextStepLabel={tx('Personen')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Personen')}
        description={tx('Wer ist zuständig und wer beauftragt die Maßnahmen?')}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Zuständige Person')}</h3>
            <EntitySelectStep
              {...flow.picks.zustaendig.select}
              {...flow.pick('zustaendig')}
              searchPlaceholder={tx('Name suchen …')}
              avatar="initials"
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">{tx('Beauftragende Person')}</h3>
            <EntitySelectStep
              {...flow.picks.beauftragt_von.select}
              {...flow.pick('beauftragt_von')}
              searchPlaceholder={tx('Name suchen …')}
              avatar="initials"
            />
          </div>
        </div>
        <StepNav
          onBack={() => setStep(2)}
          onNext={() => flow.validateStep(3)}
          nextStepLabel={tx('Prüfen')}
        />
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'vorhaben', label: tx('Vorhaben'), value: pickLabel('vorhaben'), step: 1 },
              { key: 'zustaendig', label: tx('Zuständige Person'), value: pickLabel('zustaendig'), step: 3 },
              { key: 'beauftragt_von', label: tx('Beauftragende Person'), value: pickLabel('beauftragt_von'), step: 3 },
              { key: 'frist', label: tx('Frist'), value: fristen, step: 2 },
              { key: 'status', label: tx('Status'), value: tx('Offen') },
            ]}
            whatHappensNext={tx('Jede Maßnahme wird als eigener Eintrag mit Status „Offen“ angelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Erkenntnisse erfassen'), href: '#/intents/erkenntnisse-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
