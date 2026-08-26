'use client'
import { useEffect } from 'react';;
import { useApplicationSettings } from '../Auth/useApplicationContext';





export default function MAIN_LAYOUT({ children }) {
     const { applicationsettings, setApplicationSettings } = useApplicationSettings();

     const getRetrieval = async function () {
          // Try to get cached data from localStorage first
          const cached = typeof window !== 'undefined' ? localStorage.getItem('applicationsettings') : null;
          if (cached) {
               try {
                    const user = JSON.parse(cached);
                    if (user && Object.keys(user).length > 0) {
                         setApplicationSettings(user);
                         return;
                    }
               } catch (e) {
                    // Ignore parse errors and continue to fetch
               }
          }

          // If no cache, fetch from API
          const retrieveContext = await fetch('/api/auth/context-retrieval',
               {
                    method: 'GET',
                    headers: {
                         'Content-Type': 'application/json',
                    }
               }
          );
          const data = await retrieveContext.json();
          const { user, error, redirect, settings } = data;

          if (error && redirect) {
               window.location.href = redirect;
               return null;
          }

          if (!user) return null;
          setApplicationSettings({ user, settings });
          // Cache the data in localStorage
          if (typeof window !== 'undefined') {
               localStorage.setItem('applicationsettings', JSON.stringify({ ...user, settings }));
          }

          window.location.reload();
     }


     useEffect(() => {
          if (!applicationsettings) {
               getRetrieval();
          }
     }, [applicationsettings]);



     if (!applicationsettings) return null;
     return (
          <div >
               {children}
          </div>
     );
}
