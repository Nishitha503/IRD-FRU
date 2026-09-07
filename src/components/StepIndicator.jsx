import React from 'react';
import { Upload, Columns, Sparkles, FileCheck } from 'lucide-react';
import { getTranslation } from '../utils/translations';

export default function StepIndicator({ currentStep, setStep, maxStepAllowed, language = 'en' }) {
  const t = getTranslation(language);

  const steps = [
    {
      id: 1,
      title: t.step1Title,
      desc: t.step1Desc,
      icon: Upload,
    },
    {
      id: 2,
      title: t.step2Title,
      desc: t.step2Desc,
      icon: Columns,
    },
    {
      id: 3,
      title: t.step3Title,
      desc: t.step3Desc,
      icon: Sparkles,
    },
    {
      id: 4,
      title: t.step4Title,
      desc: t.step4Desc,
      icon: FileCheck,
    },
  ];

  return (
    <div className="step-nav">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        const isClickable = step.id <= maxStepAllowed;

        return (
          <React.Fragment key={step.id}>
            <button
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isClickable && setStep(step.id)}
              disabled={!isClickable}
              style={{
                cursor: isClickable ? 'pointer' : 'not-allowed',
                opacity: isClickable ? 1 : 0.5,
              }}
            >
              <div className="step-number">
                {isCompleted ? '✓' : step.id}
              </div>
              <div>
                <div className="step-label-title">{step.title}</div>
                <div className="step-label-desc">{step.desc}</div>
              </div>
            </button>

            {index < steps.length - 1 && (
              <div
                className="step-connector"
                style={{
                  background: isCompleted ? 'var(--accent-emerald)' : '#1e293b',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
