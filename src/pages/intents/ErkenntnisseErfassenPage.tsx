/**
 * Erkenntnisse erfassen — 3-Schritt-Wizard + Prüfen.
 * Steps: 1) Vorhaben wählen → 2) Mehrere Erkenntnisse (Art, Titel, Beschreibung, Herkunft, Schutzstufe) erfassen
 *        → 3) Zuständige Person angeben → 4) Prüfen & anlegen.
 * Reads: vorhaben, beteiligte. Writes: erkenntnisse (mehrere pro Durchlauf, via useErkenntnisseErfassenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, ListEntries, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { ListEntries } from '@/components/blocks/ListEntries';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useErkenntnisseErfassenFlow } from '@/lib/journey/flows/ErkenntnisseErfassen';
import { tx } from '@/i18n';

export default function ErkenntnisseErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useErkenntnisseErfassenFlow({
    steps: { vorhaben: 1, art: 2, titel: 2, beschreibung: 2, herkunft: 2, schutzstufe: 2, zustaendig: 3 },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel') || fieldText(r, 'kennung'),
        subtitle: [fieldText(r, 'kennung'), fieldLookup(r, 'zustand')?.label].filter(Boolean).join(' · '),
      }),
      zustaendig: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
      }),
    },
  });

  const f = flow.forms.erkenntnisse;
  const vorhabenId = f.get('vorhaben') as string | undefined;
  const zustaendigId = f.get('zustaendig') as string | undefined;
  const entries = flow.lists.erkenntnisse.entries;

  return (
    <IntentWizardShell
      title={tx('Erkenntnisse erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Beiträge, Quellen, Annahmen, Fallfragen oder Einwände zu einem Vorhaben festhalten.'),
        needs: [tx('Das betroffene Vorhaben'), tx('Titel und Art jeder Erkenntnis')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehören die Erkenntnisse?')}>
        <Field form={flow.forms.erkenntnisse} name="vorhaben">
          <EntitySelectStep
            {...flow.picks.vorhaben.select}
            {...flow.pick('vorhaben')}
            searchPlaceholder={tx('Titel oder Kennung …')}
          />
        </Field>
      </WizardStep>

      <WizardStep
        label={tx('Erkenntnisse')}
        description={tx('Erfasse eine oder mehrere Erkenntnisse — mit „Hinzufügen“ kommt die nächste dazu.')}
      >
        <ListEntries list={flow.lists.erkenntnisse}>
          <Bound form={flow.forms.erkenntnisse} name="art" />
          <Bound form={flow.forms.erkenntnisse} name="titel" />
          <Bound form={flow.forms.erkenntnisse} name="beschreibung" rows={3} />
          <Bound form={flow.forms.erkenntnisse} name="herkunft" />
          <Bound form={flow.forms.erkenntnisse} name="schutzstufe" />
        </ListEntries>
        <StepNav
          onBack={() => setStep(1)}
          onNext={() => flow.validateStep(2)}
          nextStepLabel={tx('Zuständige Person')}
        />
      </WizardStep>

      <WizardStep
        label={tx('Zuständig')}
        description={tx('Wer ist für diese Erkenntnisse zuständig?')}
      >
        <Field form={flow.forms.erkenntnisse} name="zustaendig">
          <EntitySelectStep
            {...flow.picks.zustaendig.select}
            {...flow.pick('zustaendig')}
            searchPlaceholder={tx('Name suchen …')}
          />
        </Field>
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
              { key: 'vorhaben', label: tx('Vorhaben'), value: (vorhabenId && flow.picks.vorhaben.labelOf(vorhabenId)) || '—', step: 1 },
              { key: 'erkenntnisse', label: tx('Erkenntnisse'), value: entries.length ? entries.map(e => e.labels.titel || String(e.values.titel ?? '')).join(', ') : '—', step: 2 },
              { key: 'zustaendig', label: tx('Zuständige Person'), value: (zustaendigId && flow.picks.zustaendig.labelOf(zustaendigId)) || '—', step: 3 },
              { key: 'status', label: tx('Status'), value: tx('Offen') },
            ]}
            whatHappensNext={tx('Jede Erkenntnis wird als eigener Eintrag mit dem heutigen Datum angelegt.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Entscheidung festhalten'), href: '#/intents/entscheidung-festhalten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
