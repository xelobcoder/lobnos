'use client';

import React from 'react';
import { Form } from 'react-bootstrap';
import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import styles from './InstrumentMaintenanceManager.module.css';

export type MaintenanceCheckDefinition = {
     title: string;
     instructions: string;
     kind: 'completion' | 'pass_fail' | 'numeric';
     required: boolean;
     min: number | string | null;
     max: number | string | null;
     unit: string;
};

export function maintenanceCheckStatus(check: MaintenanceCheckDefinition, value: string): 'pending' | 'pass' | 'fail' | 'invalid' {
     if (!value.trim()) return 'pending';
     if (check.kind === 'numeric') {
          const number = Number(value);
          if (!Number.isFinite(number)) return 'invalid';
          return number >= Number(check.min) && number <= Number(check.max) ? 'pass' : 'fail';
     }
     if (check.kind === 'completion') return value === 'completed' ? 'pass' : value === 'not_completed' ? 'fail' : 'invalid';
     return value === 'pass' ? 'pass' : value === 'fail' ? 'fail' : 'invalid';
}

export function maintenanceCheckSummary(checks: MaintenanceCheckDefinition[], values: Record<number, string>) {
     const states = checks.map((check, index) => maintenanceCheckStatus(check, values[index] || ''));
     const recorded = states.filter(state => state === 'pass' || state === 'fail').length;
     const failedCount = states.filter(state => state === 'fail').length;
     const requiredOutstanding = checks.filter((check, index) => check.required && states[index] === 'pending').length;
     const invalid = states.includes('invalid');
     return {
          recorded, failedCount, requiredOutstanding, invalid,
          result: failedCount ? 'Fail' : invalid || !recorded || requiredOutstanding ? 'Incomplete' : 'Pass',
     };
}

export function MaintenanceCheckInput({ check, index, taskId, value, onChange }: {
     check: MaintenanceCheckDefinition;
     index: number;
     taskId: number;
     value: string;
     onChange: (value: string) => void;
}) {
     const status = maintenanceCheckStatus(check, value);
     const id = `maintenance-task-${taskId}-check-${index}`;
     const options = check.kind === 'completion'
          ? [{ value: 'completed', label: 'Completed' }, { value: 'not_completed', label: 'Not completed' }]
          : [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }];
     const statusMessage = status === 'pass' ? 'Within specification'
          : status === 'fail' ? (check.kind === 'numeric'
               ? `Failed: ${value} ${check.unit} is outside ${check.min} to ${check.max} ${check.unit}` : 'Failed')
               : status === 'invalid' ? 'Enter a valid response' : '';
     const stateClass = status === 'pass' ? styles.executionCheckPass : status === 'fail' || status === 'invalid' ? styles.executionCheckFail : '';
     return <div className={`${styles.executionCheck} ${styles.executionItem} ${stateClass}`}>
          <div className={styles.executionHeading}>
               <span className={status === 'pass' ? styles.checkIconPass : status === 'fail' || status === 'invalid' ? styles.checkIconFail : ''} aria-hidden="true">
                    {status === 'pass' ? <RiCheckLine size={18} /> : status === 'fail' || status === 'invalid' ? <RiCloseLine size={18} /> : index + 1}
               </span>
               <div><strong id={`${id}-label`}>{check.title} {check.required ? '(required)' : '(optional)'}</strong>{check.instructions && <small>{check.instructions}</small>}</div>
          </div>
          <div className={styles.checkResponse}>
               {check.kind === 'numeric' ? <>
                    <Form.Control id={id} type="number" step="any" value={value} aria-labelledby={`${id}-label`} aria-describedby={`${id}-range ${id}-status`} aria-invalid={status === 'fail' || status === 'invalid'} onChange={event => onChange(event.target.value)} />
                    <small id={`${id}-range`}>Acceptable: {check.min} to {check.max} {check.unit} (inclusive)</small>
               </> : <div className={styles.responseOptions} role="radiogroup" aria-labelledby={`${id}-label`}>
                    {options.map(option => <label key={option.value} className={styles.responseChoice}>
                         <input type="radio" name={id} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
                         <span>{option.label}</span>
                    </label>)}
                    {value && <button type="button" className={styles.clearResponse} onClick={() => onChange('')}>Clear</button>}
               </div>}
               <div id={`${id}-status`} className={styles.checkStatus} aria-live="polite">{statusMessage}</div>
          </div>
     </div>;
}
