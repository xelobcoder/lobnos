'use client';
import React, { useState, ReactElement } from 'react';
import styles from './RegistrationWrapper.module.css';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

interface RegistrationWrapperProps {
    isOnlyRegistration?: boolean;
    formSteps?: ReactElement<any>[];
    stepLabels?: string[];
}

export const RegistrationWrapper = ({ isOnlyRegistration = false, formSteps = [], stepLabels = [] }: RegistrationWrapperProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const maxSteps = formSteps.length - 1;

    const nextStep = () => {
        if (currentStep < maxSteps) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleStepClick = (index: number) => {
        if (index <= maxSteps) {
            setCurrentStep(index);
        }
    };

    if (isOnlyRegistration || formSteps.length <= 1) {
        return <div className={styles.registrationContent}>{formSteps[0]}</div>;
    }

    const progressPercent = maxSteps > 0 ? Math.round((currentStep / maxSteps) * 100) : 0;

    return (
        <div className={styles.updatePageWrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Patient Record Sections</div>
                <div className={styles.sidebarMeta}>
                    <div className={styles.sidebarMetaStatus}>
                        <span>{`Step ${currentStep + 1} of ${stepLabels.length}`}</span>
                        <span>{`${progressPercent}%`}</span>
                    </div>
                    <div className={styles.stepProgress}>
                        <div className={styles.stepProgressFill} style={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
                <nav className={styles.sidebarNav}>
                    {stepLabels.map((label, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`${styles.sidebarItem} ${currentStep === index ? styles.activeSidebarItem : ''}`}
                            onClick={() => handleStepClick(index)}
                        >
                            <span className={styles.sidebarItemIndex}>{index + 1}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className={styles.contentArea}>
                <div className={styles.formContent}>{formSteps[currentStep]}</div>
                <div className={styles.navigationButtons}>
                    <button className="btn btn-light" onClick={prevStep} disabled={currentStep === 0}>
                        <RiArrowLeftSLine size={24} />
                    </button>
                    <button className="btn btn-light" onClick={nextStep} disabled={currentStep === maxSteps}>
                        <RiArrowRightSLine size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};