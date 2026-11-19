'use client'
import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../../lib/errorMessage';
import { useApplicationSettings } from '../Auth/useApplicationContext';





export default function MAIN_LAYOUT({ children }: {children?: React.ReactNode}) {
     const { applicationsettings, setApplicationSettings } = useApplicationSettings();
     const [contextError, setContextError] = useState('');
     const [retry, setRetry] = useState(0);
     const [checking, setChecking] = useState(true);

     const getRetrieval = useCallback(async function (signal: AbortSignal) {
          const requestController = new AbortController();
          let timedOut = false;
          const abortForUnmount = () => requestController.abort();
          signal.addEventListener('abort', abortForUnmount, { once: true });
          const timeoutId = window.setTimeout(() => {
               timedOut = true;
               requestController.abort();
          }, 70_000);
          try {
               let retrieveContext = await fetch('/api/auth/context-retrieval', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store', signal: requestController.signal,
               });
               let data = await retrieveContext.json();
               if(data?.code==='SESSION_ROLE_CHANGED') {
                    const recovery=await fetch('/api/auth/refresh-role-session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',credentials:'include',cache:'no-store',signal:requestController.signal});
                    const recoveryData=await recovery.json();
                    if(!recovery.ok||recoveryData?.status!==true)throw new Error(errorMessage(recoveryData?.error,'Your workspace session could not be restored. Sign out and sign in again.'));
                    retrieveContext=await fetch('/api/auth/context-retrieval',{headers:{'Content-Type':'application/json'},credentials:'include',cache:'no-store',signal:requestController.signal});
                    data=await retrieveContext.json();
                    if(data?.code==='SESSION_ROLE_CHANGED')throw new Error('Your active role could not be confirmed. Sign out and sign in again.');
               }
               if (requestController.signal.aborted) return;
               if (data?.passwordChangeRequired === true) {
                    window.location.replace('/authentications/update-password');
                    return null;
               }
               const { user, error, redirect, settings } = data;
               const authenticatedUser = user?.user ?? user;

               if (retrieveContext.status === 401 || (error && redirect === '/authentications/login')) {
                    window.location.replace('/authentication/logout');
                    return null;
               }
               if (!retrieveContext.ok || error) throw new Error(errorMessage(error || data.message, 'Unable to verify your session. Please try again.'));
               if (!authenticatedUser) throw new Error('Your account details could not be loaded. Please retry or sign in again.');
               if (!authenticatedUser.role) throw new Error('The server returned incomplete account details. Please try again.');
               const freshSettings = {
                    ...user,
                    user: authenticatedUser,
                    settings,
               };
               setApplicationSettings(freshSettings);
               if (typeof window !== 'undefined') {
                    try { localStorage.setItem('applicationsettings', JSON.stringify(freshSettings)); } catch { /* A blocked cache must not prevent sign-in. */ }
               }
          } catch (error: any) {
               if (!signal.aborted) {
                    const message = timedOut
                         ? 'Session restoration timed out. Check your connection and try again.'
                         : error instanceof SyntaxError
                              ? 'The session service returned an invalid response. Please try again.'
                              : errorMessage(error, 'Unable to connect to the session service.');
                    setContextError(message);
               }
          } finally {
               window.clearTimeout(timeoutId);
               signal.removeEventListener('abort', abortForUnmount);
               if (!signal.aborted) setChecking(false);
          }
     }, [setApplicationSettings]);


     useEffect(() => {
          const controller = new AbortController();
          const startTimer = window.setTimeout(() => { void getRetrieval(controller.signal); }, 0);
          return () => {
               window.clearTimeout(startTimer);
               controller.abort();
          };
     }, [getRetrieval, retry]);



     if (contextError) return <section className="alert alert-danger m-3" role="alert">
          <h1 className="h5">Unable to load your workspace</h1><p>{contextError}</p>
          <div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-primary" disabled={checking} onClick={() => { setContextError(''); setChecking(true); setRetry(value => value + 1); }}>{checking ? 'Retrying…' : 'Try again'}</button><a className="btn btn-outline-secondary" href="/authentication/logout">Sign out and sign in again</a></div>
     </section>;
     if (checking) return <p className="p-3" role="status">Restoring your workspace session...</p>;
     if (!applicationsettings) return <p className="p-3" role="status">Loading your workspace…</p>;
     return (
          <div >
               {children}
          </div>
     );
}
