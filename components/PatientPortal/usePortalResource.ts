"use client";

import { useCallback, useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import { PortalResponse, errorMessage, unwrap } from '../../lib/patientPortal';

/** Loads a patient-portal GET endpoint and exposes loading, error, error code and a reload function. */
export function usePortalResource<T>(endpoint: string | null) {
     const [data, setData] = useState<T | null>(null);
     const [loading, setLoading] = useState<boolean>(Boolean(endpoint));
     const [error, setError] = useState('');
     const [code, setCode] = useState('');
     const [version, setVersion] = useState(0);

     useEffect(() => {
          if (!endpoint) return;
          let current = true;
          setLoading(true);
          setError('');
          setCode('');
          customFetch(endpoint)
               .then((response: PortalResponse<T>) => {
                    if (!current) return;
                    if (response?.status !== 'success') setCode(String(response?.code || ''));
                    setData(unwrap<T>(response));
               })
               .catch((reason: unknown) => {
                    if (current) setError(errorMessage(reason, 'Unable to load this page. Check your connection and try again.'));
               })
               .finally(() => {
                    if (current) setLoading(false);
               });
          return () => { current = false; };
     }, [endpoint, version]);

     const reload = useCallback(() => setVersion((value) => value + 1), []);
     return { data, loading, error, code, reload };
}
