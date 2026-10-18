"use client";

import { customFetchMutation, handleLogout } from '../Auth/customFetch';

/** Ends the patient's portal sessions on the server, then clears the browser session. */
export async function signOutPatient() {
     try {
          await customFetchMutation('logins/logout', 'POST');
     } catch {
          // The browser session is still cleared below.
     }
     await handleLogout();
}
