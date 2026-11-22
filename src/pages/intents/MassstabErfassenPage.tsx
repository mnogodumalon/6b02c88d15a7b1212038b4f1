/**
 * Maßstab oder Grenze erfassen — 3-Schritt-Wizard.
 * Steps: 1) Person wählen, deren Maßstab gilt → 2) Maßstäbe erfassen (Vorhaben, Art, Beschreibung, Vorrang; mehrere Einträge) → 3) Prüfen & anlegen.
 * Reads: vorhaben, beteiligte. Writes: massstaebe_und_grenzen (one record per entry, via useMassstabErfassenFlow).
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
import { fieldText, fieldLookup } from '@/lib/journey';
import { useMassstabErfassenFlow } from '@/lib/journey/flows/MassstabErfassen';
import { tx } from '@/i18n';

export default function MassstabErfassenPage() {
  const [step, setStep] = useState(1);
  const flow = useMassstabErfassenFlow({
    steps: { massstab_von: 1, vorhaben: 2, art: 2, beschreibung: 2, vorrang: 2 },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel') || fieldText(r, 'kennung'),
        subtitle: [fieldText(r, 'kennung'), fieldLookup(r, 'zustand')?.label].filter(Boolean).join(' · '),
      }),
      massstab_von: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
        subtitle: fieldText(r, 'organisation'),
      }),
    },
  });
  const form = flow.forms.massstaebe_und_grenzen;

  return (
    <IntentWizardShell
      title={tx('Maßstab oder Grenze erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, woran ein Vorhaben gemessen wird und wo seine Grenzen liegen.'),
        needs: [tx('Das Vorhaben'), tx('Die Person, deren Maßstab gilt'), tx('Eine Beschreibung des Maßstabs')],
      }}
    >
      <WizardStep label={tx('Person')} description={tx('Wessen Maßstab ist das? Die Person gilt für den ersten Eintrag.')}>
        <EntitySelectStep
          {...flow.picks.massstab_von.select}
          {...flow.pick('massstab_von')}
          avatar="initials"
          searchPlaceholder={tx('Name oder Organisation …')}
        />
        <StepNav onNext={() => flow.validateStep(1)} nextStepLabel={tx('Maßstäbe')} />
      </WizardStep>
      <WizardStep
        label={tx('Maßstäbe')}
        description={tx('Vorhaben, Art und Beschreibung festlegen — weitere Maßstäbe kannst du nacheinander hinzufügen.')}
      >
        <ListEntries list={flow.lists.massstaebe_und_grenzen}>
          <div className="space-y-6">
            <section className="space-y-2">
              <h3 className="text-sm font-medium">{tx('Für welches Vorhaben gilt der Maßstab?')}</h3>
              <EntitySelectStep
                {...flow.picks.vorhaben.select}
                {...flow.pick('vorhaben')}
                searchPlaceholder={tx('Titel oder Kennung …')}
              />
            </section>
            <Bound form={form} name="art" />
            <Bound form={form} name="beschreibung" rows={3} />
            <Bound form={form} name="vorrang" hint={tx('Gilt im Konfliktfall zuerst')} />
          </div>
        </ListEntries>
        <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Prüfen')} />
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Für jeden Eintrag wird ein Maßstab beziehungsweise eine Grenze am Vorhaben angelegt.')}
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
            { label: tx('Maßnahme anlegen'), href: '#/intents/massnahme-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
