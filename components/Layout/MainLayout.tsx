'use client'
import { useCallback, useEffect } from 'react';
import { useApplicationSettings } from '../Auth/useApplicationContext';





export default function MAIN_LAYOUT({ children }) {
     const { applicationsettings, setApplicationSettings } = useApplicationSettings();

     const getRetrieval = useCallback(async function () {
          const cached = typeof window !== 'undefined' ? localStorage.getItem('applicationsettings') : null;
          if (cached) {
               try {
                    const user = JSON.parse(cached);
                    if (user && Object.keys(user).length > 0) {
                         setApplicationSettings(user);
                    }
               } catch {
                    localStorage.removeItem('applicationsettings');
               }
          }

          try {
               const retrieveContext = await fetch('/api/auth/context-retrieval', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
               });
               const data = await retrieveContext.json();
               const { user, error, redirect, settings } = data;
               const authenticatedUser = user?.user ?? user;

               if (error && redirect) {
                    window.location.href = redirect;
                    return null;
               }

               if (!authenticatedUser) throw new Error('Application context was not returned');
               const freshSettings = {
                    ...user,
                    user: authenticatedUser,
                    settings,
               };
               setApplicationSettings(freshSettings);
               if (typeof window !== 'undefined') {
                    localStorage.setItem('applicationsettings', JSON.stringify(freshSettings));
               }
          } catch (error) {
               throw error;
          }
     }, [setApplicationSettings]);


     useEffect(() => {
          getRetrieval();
     }, [getRetrieval]);



     if (!applicationsettings) return null;
     return (
          <div >
               {children}
          </div>
     );
}
