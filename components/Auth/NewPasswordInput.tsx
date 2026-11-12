'use client';
import { ChangeEvent, forwardRef, InputHTMLAttributes, useEffect, useRef, useState } from 'react';
import { passwordProblem, suggestPassword } from '../../lib/passwordPolicy';
import styles from './NewPasswordInput.module.css';

export function validatePasswordControl(id: string): boolean {
    const control = document.getElementById(id)?.closest('[data-password-control]');
    return Boolean(control) && Array.from(control!.querySelectorAll('input')).every(input => input.reportValidity());
}

const NewPasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { confirmation?: boolean }>(function NewPasswordInput({ confirmation = false, ...props }, externalRef) {
    const [local, setLocal] = useState('');
    const [visible, setVisible] = useState(false);
    const [sounds, setSounds] = useState(false);
    const [confirm, setConfirm] = useState('');
    const [suggestionError, setSuggestionError] = useState('');
    const field = useRef<HTMLInputElement>(null);
    const confirmationField = useRef<HTMLInputElement>(null);
    const value = props.value === undefined ? local : String(props.value);
    const problem = passwordProblem(value);
    useEffect(() => { if (!value) { setVisible(false); setConfirm(''); } }, [value]);
    useEffect(() => { field.current?.setCustomValidity(value ? problem || '' : ''); }, [value, problem]);
    useEffect(() => { confirmationField.current?.setCustomValidity(confirm === value ? '' : 'Passwords do not match.'); }, [value, confirm]);
    useEffect(() => {
        const form = field.current?.form;
        const reset = () => { setLocal(''); setConfirm(''); };
        form?.addEventListener('reset', reset);
        return () => form?.removeEventListener('reset', reset);
    }, []);
    function changed(event: ChangeEvent<HTMLInputElement>) {
        const next = event.target.value;
        event.target.setCustomValidity(next ? passwordProblem(next) || '' : '');
        confirmationField.current?.setCustomValidity(confirm === next ? '' : 'Passwords do not match.');
        setLocal(next);
        props.onChange?.(event);
    }
    function suggest() {
        let next: string;
        try { next = suggestPassword(); setSuggestionError(''); }
        catch { setSuggestionError('Secure suggestions are unavailable. Please enter a password.'); return; }
        setLocal(next); setConfirm('');
        props.onChange?.({ target: { value: next, name: props.name, id: props.id }, currentTarget: { value: next, name: props.name, id: props.id } } as ChangeEvent<HTMLInputElement>);
        if (sounds) {
            try {
                const audio = new AudioContext();
                const oscillator = audio.createOscillator(); const gain = audio.createGain();
                gain.gain.value = 0.025; oscillator.frequency.value = 660;
                oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.07);
                oscillator.onended = () => { void audio.close(); };
            } catch { /* Sound availability never prevents password entry. */ }
        }
    }
    return <div className={styles.control} data-password-control data-strength={value ? problem ? 'weak' : 'strong' : 'empty'}>
        <div className={styles.row}><input {...props} ref={element => { field.current = element; if (typeof externalRef === 'function') externalRef(element); else if (externalRef) externalRef.current = element; }} value={value} onChange={changed} type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={12} maxLength={72} style={{ ...props.style, fontFamily: 'ui-monospace, monospace' }} />
            <button type="button" onClick={() => setVisible(!visible)} aria-pressed={visible} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? 'Hide' : 'Show'}</button></div>
        <meter min={0} max={3} value={!value ? 0 : problem ? 1 : value.length >= 20 ? 3 : 2} aria-label="Password strength" />
        <small>{value ? problem || (value.length >= 20 ? 'Strong password' : 'Meets password rules') : 'At least 12 characters, a letter and a number. Avoid common passwords. Maximum 72 UTF-8 bytes.'}</small>
        {suggestionError && <small role="status">{suggestionError}</small>}
        <div className={styles.tools}><button type="button" disabled={props.disabled} onClick={suggest}>Suggest secure password</button><button type="button" aria-pressed={sounds} onClick={() => setSounds(!sounds)}>Sound {sounds ? 'on' : 'off'}</button></div>
        {confirmation && <div role="group" aria-label="Password confirmation"><span>Confirm password</span><input aria-label="Confirm password" ref={confirmationField} type="password" autoComplete="new-password" maxLength={72} value={confirm} onChange={event => setConfirm(event.target.value)} required={Boolean(value) || props.required} disabled={props.disabled} className={props.className} />{confirm && confirm !== value && <small>Passwords do not match.</small>}</div>}
    </div>;
});
export default NewPasswordInput;
