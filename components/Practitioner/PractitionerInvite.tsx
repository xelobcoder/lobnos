'use client';
import NewPasswordInput from '../Auth/NewPasswordInput';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { customPost } from '../Auth/customFetch';
import s from './Practitioner.module.css';
export default function PractitionerInvite({ token }: {
    token: string;
}) {
    const [username, setUsername] = useState(''), [password, setPassword] = useState(''), [confirm, setConfirm] = useState(''), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false);
    async function call(action: string, body: any) { const result = await customPost(`practitioner-access/public/${action}`, 'POST', { token, ...body }, false, true); if (result?.success !== true)
        throw Error(result?.message || 'This invitation could not be verified'); return result.data; }
    useEffect(() => { let live = true; call('verify', {}).then(v => { if (live)
        setUsername(v.username); }).catch(e => { if (live)
        setError(e.message); }).finally(() => { if (live)
        setLoading(false); }); return () => { live = false; }; }, [token]);
    return <main className={s.activation}><section className={s.panel}><span className={s.eyebrow}>PRIME LABORATORY · PRACTITIONER ACCESS</span><h1>{done ? 'Your practitioner account is ready' : 'Activate your practitioner account'}</h1>{error && <div role="alert" className={s.error}>{error}</div>}{loading ? <p role="status">Verifying your invitation…</p> : done ? <><p>Sign in using <strong>{username}</strong> and the password you chose.</p><Link className={s.primary} href={`/authentications/login?mode=doctor&username=${encodeURIComponent(username)}`}>Go to practitioner sign in</Link></> : username ? <form onSubmit={async (e) => { e.preventDefault(); if (busy)
        return; if (password !== confirm) {
        setError('Passwords do not match');
        return;
    } setBusy(true); setError(''); try {
        await call('accept', { password });
        setDone(true);
        setPassword('');
        setConfirm('');
    }
    catch (err: any) {
        setError(err.message);
    }
    finally {
        setBusy(false);
    } }}><p>Your username is <strong>{username}</strong>. This link can be used once.</p><label className={s.field}>Choose a password<NewPasswordInput aria-label="Choose a password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)}/><small>At least 12 characters with a letter and a number. Avoid common passwords.</small></label><label className={s.field}>Confirm password<input aria-label="Confirm password" type="password" autoComplete="new-password" required value={confirm} onChange={e => setConfirm(e.target.value)}/></label><button className={s.primary} disabled={busy}>{busy ? 'Activating…' : 'Activate account'}</button></form> : <p>Contact the facility for a new invitation. Do not share your password or activation link.</p>}</section></main>;
}
