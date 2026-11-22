/**
 * Vorhaben anlegen — 7-Schritt-Wizard.
 * Steps: 1) Arbeitsbereich & Sichtbarkeit → 2) Titel & Anlass → 3) Absicht & Art → 4) Verantwortung → 5) Vertretung
 *        → 6) Frist & erwarteter Nutzen → 7) Prüfen & anlegen (als Entwurf oder aktiviert).
 * Reads: beteiligte. Writes: vorhaben (Kennung vergibt das System).
 * Composes: IntentWizardShell, Bound, EntitySelectStep, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText } from '@/lib/journey';
import { useVorhabenAnlegenFlow } from '@/lib/journey/flows/VorhabenAnlegen';
import { tx } from '@/i18n';

export default function VorhabenAnlegenPage() {
  const [step, setStep] = useState(1);
  const person = (r: Parameters<typeof fieldText>[0]) => ({
    id: r.id,
    title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
    subtitle: fieldText(r, 'organisation'),
  });
  const flow = useVorhabenAnlegenFlow({
    steps: {
      arbeitsbereich: 1, sichtbarkeit: 1,
      titel: 2, anlass_herkunft: 2,
      absicht: 3, absicht_art: 3,
      verantwortlicher: 4, vertretung: 5,
      frist: 6, wiedervorlage: 6, erwarteter_nutzen: 6,
    },
    items: { verantwortlicher: person, vertretung: person },
  });

  return (
    <IntentWizardShell
      title={tx('Vorhaben anlegen')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Lege ein neues Vorhaben mit Verantwortung und Absicht an.'),
        needs: [tx('Arbeitsbereich'), tx('Anlass und Herkunft'), tx('Verantwortliche Person')],
      }}
    >
      <WizardStep label={tx('Bereich')} description={tx('In welchem Arbeitsbereich liegt das Vorhaben und wer darf es sehen?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="arbeitsbereich" />
          <Bound form={flow.forms.vorhaben} name="sichtbarkeit" />
          <StepNav hideBack onNext={() => flow.validateStep(1)} nextStepLabel={tx('Titel und Anlass')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Anlass')} description={tx('Gib dem Vorhaben einen Titel und erkläre, woher es kommt.')}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="titel" />
          <Bound form={flow.forms.vorhaben} name="anlass_herkunft" rows={4} />
          <StepNav onBack={() => setStep(1)} onNext={() => flow.validateStep(2)} nextStepLabel={tx('Absicht')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Absicht')} description={tx('Was soll mit dem Vorhaben erreicht werden?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="absicht" rows={4} />
          <Bound form={flow.forms.vorhaben} name="absicht_art" allowClear />
          <StepNav onBack={() => setStep(2)} onNext={() => flow.validateStep(3)} nextStepLabel={tx('Verantwortung')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Verantwortung')} description={tx('Wer verantwortet das Vorhaben?')}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.verantwortlicher.select}
            {...flow.pick('verantwortlicher')}
            searchPlaceholder={tx('Name oder Organisation …')}
          />
          <StepNav onBack={() => setStep(3)} onNext={() => flow.validateStep(4)} nextStepLabel={tx('Vertretung')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Vertretung')} description={tx('Wer vertritt bei Abwesenheit?')}>
        <div className="space-y-4">
          <EntitySelectStep
            {...flow.picks.vertretung.select}
            {...flow.pick('vertretung')}
            searchPlaceholder={tx('Name oder Organisation …')}
          />
          <StepNav onBack={() => setStep(4)} onNext={() => flow.validateStep(5)} nextStepLabel={tx('Frist und Nutzen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Frist')} description={tx('Bis wann soll es laufen und was soll es bringen?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="frist" />
          <Bound form={flow.forms.vorhaben} name="wiedervorlage" />
          <Bound form={flow.forms.vorhaben} name="erwarteter_nutzen" rows={4} />
          <StepNav onBack={() => setStep(5)} onNext={() => flow.validateStep(6)} nextStepLabel={tx('Prüfen')} />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            variants={flow.actions}
            whatHappensNext={tx('Die Kennung vergibt das System automatisch.')}
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
