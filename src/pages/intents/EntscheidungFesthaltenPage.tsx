/**
 * Entscheidung festhalten — 6-Schritt-Wizard plus Prüfen.
 * Steps: 1) Vorhaben wählen → 2) Art und Gegenstand → 3) Begründung → 4) Entscheidende Person → 5) Folgen tragende Personen → 6) Status → 7) Prüfen & festhalten.
 * Reads: vorhaben, beteiligte. Writes: entscheidungen (via useEntscheidungFesthaltenFlow; Datum setzt der Flow selbst).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, Field, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { Field } from '@/components/blocks/Field';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup, fieldLookups } from '@/lib/journey';
import { useEntscheidungFesthaltenFlow } from '@/lib/journey/flows/EntscheidungFesthalten';
import { tx } from '@/i18n';

export default function EntscheidungFesthaltenPage() {
  const [step, setStep] = useState(1);
  const flow = useEntscheidungFesthaltenFlow({
    steps: { vorhaben: 1, art: 2, gegenstand: 2, begruendung: 3, entscheider: 4, folgentraeger: 5, status: 6 },
    items: {
      vorhaben: r => ({
        id: r.id,
        title: fieldText(r, 'titel') || fieldText(r, 'kennung'),
        subtitle: [fieldText(r, 'kennung'), fieldLookup(r, 'zustand')?.label].filter(Boolean).join(' · '),
      }),
      entscheider: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
        subtitle: fieldLookups(r, 'rolle').map(o => o.label).join(', '),
      }),
      folgentraeger: r => ({
        id: r.id,
        title: `${fieldText(r, 'beteiligter_firstname')} ${fieldText(r, 'beteiligter_lastname')}`.trim(),
        subtitle: fieldLookups(r, 'rolle').map(o => o.label).join(', '),
      }),
    },
  });

  return (
    <IntentWizardShell
      title={tx('Entscheidung festhalten')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Halte eine Entscheidung oder Freigabe mit Begründung und Beteiligten fest.'),
        needs: [tx('Das betroffene Vorhaben'), tx('Gegenstand und Begründung'), tx('Entscheidende und betroffene Personen')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Zu welchem Vorhaben gehört die Entscheidung?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Kennung oder Titel …')}
        />
      </WizardStep>

      <WizardStep label={tx('Art und Gegenstand')} description={tx('Worum geht es und ist es eine Entscheidung oder eine Freigabe?')} needs={['vorhaben']}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="art" />
          <Bound form={flow.forms.entscheidungen} name="gegenstand" />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Begründung')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Begründung')} description={tx('Warum wird so entschieden?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="begruendung" rows={5} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Personen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Entscheidende Person')} description={tx('Wer trifft oder erteilt die Entscheidung?')}>
        <div className="space-y-6">
          <Field form={flow.forms.entscheidungen} name="entscheider">
            <EntitySelectStep
              {...flow.picks.entscheider.select}
              {...flow.pick('entscheider')}
              avatar="initials"
              searchPlaceholder={tx('Name suchen …')}
            />
          </Field>
          <StepNav
            onBack={() => setStep(3)}
            onNext={() => flow.validateStep(4)}
            nextStepLabel={tx('Folgen tragende Personen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Folgen tragende Personen')} description={tx('Wer trägt die Folgen der Entscheidung?')}>
        <div className="space-y-6">
          <Field form={flow.forms.entscheidungen} name="folgentraeger">
            <EntitySelectStep
              {...flow.picks.folgentraeger.select}
              {...flow.pickMany('folgentraeger')}
              avatar="initials"
              searchPlaceholder={tx('Name suchen …')}
            />
          </Field>
          <StepNav
            onBack={() => setStep(4)}
            onNext={() => flow.validateStep(5)}
            nextStepLabel={tx('Status')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Status')} description={tx('In welchem Stand hältst du die Entscheidung fest?')}>
        <div className="space-y-4">
          <Bound form={flow.forms.entscheidungen} name="status" />
          <StepNav
            onBack={() => setStep(5)}
            onNext={() => flow.validateStep(6)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            variants={flow.actions}
            whatHappensNext={tx('Die Entscheidung wird mit dem heutigen Datum beim Vorhaben festgehalten.')}
          />
        )}
      </WizardStep>

      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Maßnahme anlegen'), href: '#/intents/massnahme-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Aus der Entscheidung kannst du direkt Maßnahmen ableiten.')}
        />
      )}
    </IntentWizardShell>
  );
}
