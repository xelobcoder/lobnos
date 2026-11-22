"use client";

import { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';

type ConsentMode = 'off' | 'optional' | 'required';
type CollectionConsentPayload = { confirmed: true };
export type CollectionConsentState = {
     blocked: boolean;
     loading?: boolean;
     error?: string;
     mode?: ConsentMode;
     billingid?: number;
     payload?: CollectionConsentPayload;
};

export default function CollectionConsent({
     billingid,
     onReady,
}: {
     billingid: number;
     onReady: (state: CollectionConsentState) => void;
}) {
     const [mode, setMode] = useState<ConsentMode>();
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState('');
     const [confirmed, setConfirmed] = useState(false);

     useEffect(() => {
          let current = true;
          onReady({ blocked: true, loading: true });

          customFetch(`patient-consents/collection?billingid=${billingid}`)
               .then(response => {
                    if (!response?.success) throw new Error(response?.message || 'Unable to check collection consent settings.');
                    const nextMode = response.data?.mode;
                    if (!['off', 'optional', 'required'].includes(nextMode)) {
                         throw new Error('Collection consent settings are invalid.');
                    }
                    if (!current) return;
                    setMode(nextMode);
                    setLoading(false);
                    onReady({ blocked: nextMode === 'required', loading: false, mode: nextMode });
               })
               .catch((cause: unknown) => {
                    if (!current) return;
                    const message = cause instanceof Error ? cause.message : 'Unable to check collection consent settings.';
                    setError(message);
                    setLoading(false);
                    onReady({ blocked: true, loading: false, error: message });
               });

          return () => {
               current = false;
          };
     }, [billingid, onReady]);

     const updateConfirmation = (checked: boolean) => {
          setConfirmed(checked);
          onReady({
               blocked: mode === 'required' && !checked,
               loading: false,
               mode,
               payload: checked ? { confirmed: true } : undefined,
          });
     };

     if (loading) return <p role="status" className="mb-3">Checking collection settings...</p>;
     if (error) return <p role="alert" className="alert alert-danger mb-3">{error}</p>;
     if (mode === 'off') return null;

     return (
          <section className="border rounded bg-body-tertiary p-3 mb-3" aria-label="Collection consent">
               <div className="d-flex align-items-center justify-content-between">
                    <strong>Consent at collection</strong>
                    <small>{mode === 'required' ? 'Required' : 'Optional'}</small>
               </div>
               <label className="d-flex gap-2 mt-3 align-items-start">
                    <input
                         type="checkbox"
                         checked={confirmed}
                         onChange={event => updateConfirmation(event.target.checked)}
                         aria-label="Patient or guardian consent confirmed"
                    />
                    <span>The patient or parent/guardian has agreed to collection of this sample.</span>
               </label>
               {mode === 'optional'
                    ? <small className="text-muted">Optional. Collection can continue without confirmation.</small>
                    : <small className="text-muted">Confirm before starting or completing collection.</small>}
          </section>
     );
}
