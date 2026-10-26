'use client'
import { useCallback, useEffect, useState } from 'react';
import { useApplicationSettings } from '../Auth/useApplicationContext';





export default function MAIN_LAYOUT({ children }) {
     const { applicationsettings, setApplicationSettings } = useApplicationSettings();
     const [contextError, setContextError] = useState('');
     const [retry, setRetry] = useState(0);
     const [checking, setChecking] = useState(true);

     const getRetrieval = useCallback(async function (signal: AbortSignal) {
          setChecking(true);
          setContextError('');
          try {
               let retrieveContext = await fetch('/api/auth/context-retrieval', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store', signal,
               });
               let data = await retrieveContext.json();
               if(data?.code==='SESSION_ROLE_CHANGED') {
                    const recovery=await fetch('/api/auth/refresh-role-session',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',credentials:'include',cache:'no-store',signal});
                    const recoveryData=await recovery.json();
                    if(!recovery.ok||recoveryData?.status!==true)throw new Error(recoveryData?.error||'Your workspace session could not be restored. Sign out and sign in again.');
                    retrieveContext=await fetch('/api/auth/context-retrieval',{headers:{'Content-Type':'application/json'},credentials:'include',cache:'no-store',signal});
                    data=await retrieveContext.json();
                    if(data?.code==='SESSION_ROLE_CHANGED')throw new Error('Your active role could not be confirmed. Sign out and sign in again.');
               }
               if (signal.aborted) return;
               const { user, error, redirect, settings } = data;
               const authenticatedUser = user?.user ?? user;

               if (retrieveContext.status === 401 || (error && redirect === '/authentications/login')) {
                    window.location.replace('/authentication/logout');
                    return null;
               }
               if (!retrieveContext.ok || error) throw new Error(typeof error === 'string' ? error : data.message || 'Unable to verify your session. Please try again.');
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
               if (!signal.aborted) setContextError(error instanceof SyntaxError ? 'The session service returned an invalid response. Please try again.' : error?.message || 'Unable to connect to the session service.');
          } finally {
               if (!signal.aborted) setChecking(false);
          }
     }, [setApplicationSettings]);


     useEffect(() => {
          const controller = new AbortController();
          void getRetrieval(controller.signal);
          return () => controller.abort();
     }, [getRetrieval, retry]);



     if (contextError) return <section className="alert alert-danger m-3" role="alert">
          <h1 className="h5">Unable to load your workspace</h1><p>{contextError}</p>
          <div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-primary" disabled={checking} onClick={() => setRetry(value => value + 1)}>{checking ? 'Retrying…' : 'Try again'}</button><a className="btn btn-outline-secondary" href="/authentication/logout">Sign out and sign in again</a></div>
     </section>;
     if (checking) return <p className="p-3" role="status">Restoring your workspace session...</p>;
     if (!applicationsettings) return <p className="p-3" role="status">Loading your workspace…</p>;
     return (
          <div >
               {children}
          </div>
     );
}
