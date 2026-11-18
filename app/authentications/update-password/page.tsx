'use client';

import { FormEvent, useState } from 'react';
import NewPasswordInput from '../../../components/Auth/NewPasswordInput';
import { customPost } from '../../../components/Auth/customFetch';
import styles from './page.module.css';

export default function UpdateStaffPasswordPage() {
     const [currentPassword, setCurrentPassword] = useState('');
     const [newPassword, setNewPassword] = useState('');
     const [busy, setBusy] = useState(false);
     const [updated, setUpdated] = useState(false);
     const [error, setError] = useState('');

     async function changePassword(event: FormEvent<HTMLFormElement>) {
          event.preventDefault();
          setBusy(true);
          setError('');
          try {
               const result = await customPost('prime/change-password', 'POST', { currentPassword, newPassword });
               if (result?.status !== 'success') {
                    throw new Error(result?.message || 'Unable to update your password. Please try again.');
               }
               setUpdated(true);
               setCurrentPassword('');
               setNewPassword('');
          } catch (failure) {
               setError(failure instanceof Error ? failure.message : 'Unable to update your password. Please try again.');
          } finally {
               setBusy(false);
          }
     }

     async function returnToSignIn() {
          setBusy(true);
          setError('');
          try {
               const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
               const result = await response.json();
               if (!response.ok || result?.status !== true) {
                    throw new Error(result?.error || 'Your password was updated, but this session could not be cleared. Please retry signing out.');
               }
               window.location.replace('/authentications/login?passwordUpdated=1');
          } catch (failure) {
               setError(failure instanceof Error ? failure.message : 'Your password was updated, but signing out failed. Please retry.');
          } finally {
               setBusy(false);
          }
     }

     return <main className={styles.page}>
          <section className={styles.card} aria-labelledby="password-title">
               <div className={styles.brandMark} aria-hidden="true">PLS</div>
               <p className={styles.eyebrow}>PRIME LABORATORY SOFTWARE</p>
               {updated ? <>
                    <h1 id="password-title">Password updated</h1>
                    <p className={styles.description}>Your password has been changed. Sign in again with your new password to continue.</p>
                    {error && <div role="alert" className={styles.error}>{error}</div>}
                    <button className={styles.submit} type="button" onClick={returnToSignIn} disabled={busy}>
                         {busy ? 'Signing out…' : 'Continue to sign in'}
                    </button>
               </> : <>
                    <h1 id="password-title">Update your password</h1>
                    <p className={styles.description}>Your password has reached its 30-day limit. Choose a new password before continuing to the application.</p>
                    {error && <div role="alert" className={styles.error}>{error}</div>}
                    <form onSubmit={changePassword}>
                         <label className={styles.label} htmlFor="current-password">Current password</label>
                         <input
                              className={styles.input}
                              id="current-password"
                              type="password"
                              autoComplete="current-password"
                              value={currentPassword}
                              onChange={event => setCurrentPassword(event.target.value)}
                              required
                              disabled={busy}
                         />
                         <label className={styles.label} htmlFor="new-password">New password</label>
                         <NewPasswordInput
                              id="new-password"
                              name="newPassword"
                              controlClassName={styles.passwordControl}
                              value={newPassword}
                              onChange={event => setNewPassword(event.target.value)}
                              required
                              disabled={busy}
                              confirmation
                         />
                         <button className={styles.submit} type="submit" disabled={busy}>
                              {busy ? 'Updating password…' : 'Update password'}
                         </button>
                    </form>
               </>}
               <p className={styles.footer}>Use a unique password that you do not use for another account.</p>
          </section>
     </main>;
}
