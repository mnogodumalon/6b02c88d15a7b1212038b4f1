/**
 * Zustand wechseln — 2-Schritt-Wizard.
 * Steps: 1) Vorhaben wählen → 2) Neuen Zustand wählen und bestätigen (ein Button je Zustand).
 * Reads: vorhaben (kennung, titel, zustand, verantwortlicher). Writes: vorhaben.zustand (update via useVorhabenZustandWechselnFlow).
 * Composes: IntentWizardShell, EntitySelectStep, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { fieldText, fieldLookup } from '@/lib/journey';
import { useVorhabenZustandWechselnFlow } from '@/lib/journey/flows/VorhabenZustandWechseln';
import { tx } from '@/i18n';

export default function VorhabenZustandWechselnPage() {
  const [step, setStep] = useState(1);
  const flow = useVorhabenZustandWechselnFlow({
    steps: { vorhaben: 1 },
    items: {
      vorhaben: (r, ctx) => {
        const kennung = fieldText(r, 'kennung');
        const titel = fieldText(r, 'titel');
        const zustand = fieldLookup(r, 'zustand');
        const person = ctx.ref('verantwortlicher');
        return {
          id: r.id,
          title: [kennung, titel].filter(Boolean).join(' — ') || tx('Ohne Titel'),
          subtitle: [zustand?.label, person].filter(Boolean).join(' · '),
        };
      },
    },
  });

  return (
    <IntentWizardShell
      title={tx('Zustand wechseln')}
      currentStep={step}
      onStepChange={setStep}
      forms={flow.formList}
      draftKey={flow.draftKey}
      intro={{
        description: tx('Ein Vorhaben aktivieren, ruhend setzen oder als Entwurf zurücksetzen.'),
        needs: [tx('Kennung oder Titel des Vorhabens')],
      }}
    >
      <WizardStep label={tx('Vorhaben')} description={tx('Welches Vorhaben soll seinen Zustand wechseln?')}>
        <EntitySelectStep
          {...flow.picks.vorhaben.select}
          {...flow.pick('vorhaben')}
          searchPlaceholder={tx('Kennung oder Titel …')}
        />
      </WizardStep>
      <WizardStep
        label={tx('Prüfen')}
        heading={tx('Neuen Zustand wählen')}
        description={tx('Wähle unten, in welchen Zustand das Vorhaben wechseln soll.')}
        needs={['vorhaben']}
      >
        {!flow.submit.done && (
          <SummaryStep
            forms={flow.formList}
            submit={flow.submit}
            variants={flow.actions}
            whatHappensNext={tx('Der Zustand des Vorhabens wird sofort geändert.')}
          />
        )}
      </WizardStep>
      {flow.submit.result && (
        <SuccessStep
          result={flow.submit.result}
          forms={flow.formList}
          submit={flow.submit}
          next={[
            { label: tx('Vorhaben beenden'), href: '#/intents/vorhaben-beenden' },
            { label: tx('Vorhaben anlegen'), href: '#/intents/vorhaben-anlegen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
