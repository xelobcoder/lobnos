'use client';
import React, { useState, ReactElement } from 'react';
import styles from './RegistrationWrapper.module.css';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';

interface RegistrationWrapperProps {
    isOnlyRegistration?: boolean;
    formSteps?: ReactElement[];
}

export const RegistrationWrapper = ({ isOnlyRegistration = false, formSteps = [] }: RegistrationWrapperProps) => {
    const allSteps = ['Photo', 'Personal Info', 'Address', 'Emergency Contact', 'Credentials', 'Settings'];
    const steps = isOnlyRegistration ? ['Personal Info'] : allSteps;
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

    return (
        <>
            <div className={styles.stepsIndicator}>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 px-md-5">
                    <div className="d-flex flex-wrap justify-content-center gap-2 mb-3 mb-md-0">
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                <div
                                    className={`${styles.step} ${currentStep === index ? styles.active : ''} ${styles.clickable}`}
                                    onClick={() => handleStepClick(index)}
                                    role="button"
                                >
                                    <div className={styles.stepNumber}>{index + 1}</div>
                                    <div className={`${styles.stepTitle} d-none d-md-block`}>{step}</div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`${styles.stepConnector} d-none d-md-block`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-light ${styles.navButton}`}
                            onClick={prevStep}
                            disabled={currentStep === 0}
                        >
                            <RiArrowLeftSLine size={24} />
                        </button>
                        <button
                            className={`btn btn-light ${styles.navButton}`}
                            onClick={nextStep}
                            disabled={currentStep === maxSteps}
                        >
                            <RiArrowRightSLine size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`${styles.registrationContent} px-3 px-md-5`}>
                {formSteps[currentStep]}
            </div>
        </>
    );
};