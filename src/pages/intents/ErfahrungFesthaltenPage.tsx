/**
 * Erfahrung festhalten — 3-Schritt-Wizard mit Prüfung.
 * Steps: 1) Vorhaben wählen → 2) Titel, Beschreibung und Erkenntnis erfassen → 3) Empfehlung und erfassende Person → Prüfen & anlegen.
 * Reads: vorhaben (nicht beendete), beteiligte. Writes: erfahrungen (über useErfahrungFesthaltenFlow).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldLookup, fieldText } from '@/lib/journey';
import { useErfahrungFesthaltenFlow } from '@/lib/journey/flows/ErfahrungFesthalten';
import { tx } from '@/i18n';

export default function ErfahrungFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useErfahrungFesthaltenFlow({
    steps: { vorhaben: 1, titel: 2, beschreibung: 2, erkenntnis: 2, empfehlung: 3, erfasser: 3 },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel') || fieldText(r, 'kennung'),
        subtitle: fieldText(r, 'kennung'),
        status: fieldLookup(r, 'zustand')?.label,
      }),
      erfasser: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
      }),
    },
    where: {
      vorhaben: r => fieldLookup(r, 'zustand')?.key !== 'beendet',
    },
  });

  return (
    <IntentWizardShell
      title={tx('Erfahrung festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte fest, was du gelernt hast, damit künftige Vorhaben davon profitieren.'),
        needs: [tx('Das betroffene Vorhaben'), tx('Deine Erkenntnis und Empfehlung')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die Erfahrung?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Titel oder Kennung …')}
        />
      </WizardStep>

      <WizardStep label={tx('Erkenntnis')} description={tx('Beschreibe, was passiert ist und was du daraus erkannt hast.')} needs={['vorhaben']}>
        <div className="space-y-4">
          <Bound form={flow.forms.erfahrungen} name="titel" />
          <Bound form={flow.forms.erfahrungen} name="beschreibung" rows={4} />
          <Bound form={flow.forms.erfahrungen} name="erkenntnis" rows={4} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Empfehlung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Empfehlung')} description={tx('Was sollten künftige Vorhaben beachten – und wer hält das fest?')} needs={['vorhaben', 'titel']}>
        <div className="space-y-6">
          <Bound form={flow.forms.erfahrungen} name="empfehlung" rows={4} />
          <EntitySelectStep
            {...flow.picks.erfasser.select}
            {...flow.pick('erfasser')}
            searchPlaceholder={tx('Name suchen …')}
          />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            whatHappensNext={tx('Die Erfahrung wird mit dem heutigen Datum beim Vorhaben abgelegt.')}
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
