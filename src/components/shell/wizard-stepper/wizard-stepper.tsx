'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

import { cn } from '@/helpers/cn';

import styles from './wizard-stepper.module.css';

export type WizardStepConfig = Readonly<{
  id: string;
  label: string;
  shortLabel: string;
  path?: string;
}>;

type WizardStepperProps = Readonly<{
  steps: readonly WizardStepConfig[];
  currentStepId: string;
  completedThrough?: number;
  ariaLabel?: string;
  /** Lets users jump back to completed steps from review to edit prior sections. */
  enableEditNavigation?: boolean;
}>;

export function WizardStepper({
  steps,
  currentStepId,
  completedThrough,
  ariaLabel = 'Wizard progress',
  enableEditNavigation = false,
}: WizardStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <ol className={styles.stepper} aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStepId;
        const isDone =
          completedThrough !== undefined ? index < completedThrough : index < currentIndex;
        const canNavigate = enableEditNavigation && isDone && !isActive && step.path !== undefined;

        const indicator = (
          <span
            className={cn(
              styles.indicator,
              isActive && styles.indicatorActive,
              isDone && styles.indicatorDone,
              canNavigate && styles.indicatorClickable,
            )}
            aria-current={isActive ? 'step' : undefined}
          >
            {isDone && !isActive ? <Check className={styles.checkIcon} aria-hidden /> : index + 1}
          </span>
        );

        const label = (
          <span
            className={cn(
              styles.label,
              isActive && styles.labelActive,
              isDone && styles.labelDone,
              canNavigate && styles.labelClickable,
            )}
          >
            <span className={styles.labelFull}>{step.label}</span>
            <span className={styles.labelShort}>{step.shortLabel}</span>
          </span>
        );

        return (
          <li key={step.id} className={styles.step}>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  styles.connector,
                  isDone && styles.connectorDone,
                  isActive && styles.connectorActive,
                )}
                aria-hidden
              />
            ) : null}

            {canNavigate ? (
              <Link href={step.path!} className={styles.stepLink} aria-label={`Edit ${step.label}`}>
                {indicator}
                {label}
              </Link>
            ) : (
              <>
                {indicator}
                {label}
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
