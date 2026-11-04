'use client';

import React, { useState } from 'react';
import styles from './RegistrationSteps.module.css';

export const RegistrationSteps = ({ children }: {children?: React.ReactNode}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = React.Children.toArray(children);

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className={styles['registration-steps']}>
            <div className={styles['steps-indicator']}>
                <div className="d-flex justify-content-center align-items-center gap-4">
                    {steps.map((_, index) => (
                        <React.Fragment key={index}>
                            <div className={`${styles.step} ${currentStep === index ? styles.active : ''}`}>
                                <div className={styles['step-number']}>{index + 1}</div>
                                <div className={styles['step-title']}>Step {index + 1}</div>
                            </div>
                            {index < steps.length - 1 && <div className={styles['step-connector']}></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className={styles['step-content']}>
                {steps[currentStep]}
            </div>

            <div className="step-buttons mt-4 d-flex justify-content-between">
                <button 
                    className="btn btn-secondary" 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                >
                    Previous
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                >
                    {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
                </button>
            </div>
        </div>
    );
};