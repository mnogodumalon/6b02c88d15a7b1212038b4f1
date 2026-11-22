/**
 * Vorhaben beenden — 4-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Ergebnis erfassen → 3) Abschlussgrund erfassen → 4) Prüfen & beenden
 * (das Abschlussdatum setzt der Ablauf selbst auf heute, der Zustand wird „beendet“).
 * Reads: vorhaben. Writes: vorhaben (aktualisiert ergebnis, abschlussgrund, abschlussdatum, zustand).
 * Composes: IntentWizardShell, EntitySelectStep, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { format } from 'date-fns';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useVorhabenBeendenFlow } from '@/lib/journey/flows/VorhabenBeenden';
import { tx } from '@/i18n';

export default function VorhabenBeendenPage() {
  const [step, setStep] = useState(1);
  const flow = useVorhabenBeendenFlow({
    steps: { vorhaben: 1, ergebnis: 2, abschlussgrund: 3 },
    items: {
      vorhaben: (r, ctx) => ({
        id: r.id,
        title: [fieldText(r, 'kennung'), fieldText(r, 'titel')].filter(Boolean).join(' — ') || tx('Ohne Titel'),
        subtitle: [fieldLookup(r, 'zustand')?.label, ctx.ref('verantwortlicher')].filter(Boolean).join(' · '),
      }),
    },
    messages: {
      ergebnis: tx('Zum Beenden braucht es Ergebnis und Abschlussgrund.'),
      abschlussgrund: tx('Zum Beenden braucht es Ergebnis und Abschlussgrund.'),
    },
  });

  return (
    <IntentWizardShell
      title={tx('Vorhaben beenden')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Ein Vorhaben mit Ergebnis und Abschlussgrund beenden.'),
        needs: [tx('Das Vorhaben'), tx('Ergebnis'), tx('Abschlussgrund')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Welches Vorhaben willst du beenden?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Kennung oder Titel …')}
        />
      </WizardStep>
      <WizardStep label={tx('Ergebnis')} description={tx('Was ist am Ende herausgekommen?')} needs={['vorhaben']}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="ergebnis" rows={5} />
          <StepNav
            onBack={() => setStep(1)}
            onNext={() => flow.validateStep(2)}
            nextStepLabel={tx('Abschlussgrund')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Abschlussgrund')} description={tx('Warum wird das Vorhaben beendet?')} needs={['vorhaben']}>
        <div className="space-y-4">
          <Bound form={flow.forms.vorhaben} name="abschlussgrund" rows={4} />
          <StepNav
            onBack={() => setStep(2)}
            onNext={() => flow.validateStep(3)}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>
      <WizardStep label={tx('Prüfen')} needs={['vorhaben']}>
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            items={[
              { key: 'abschlussdatum', label: tx('Abschlussdatum'), value: format(new Date(), 'dd.MM.yyyy') },
              { key: 'zustand', label: tx('Zustand'), value: tx('Beendet') },
            ]}
            whatHappensNext={tx('Das Vorhaben wird als beendet markiert und das Abschlussdatum auf heute gesetzt.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          undo={flow.undo}
          next={[
            { label: tx('Erfahrung festhalten'), href: '#/intents/erfahrung-festhalten' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Halte als Nächstes fest, was ihr aus dem Vorhaben gelernt habt.')}
        />
      )}
    </IntentWizardShell>
  );
}
