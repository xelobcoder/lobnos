'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Spinner } from 'react-bootstrap';
import { RiFingerprintLine, RiShieldCheckLine } from '@remixicon/react';
import { customPost } from '../../components/Auth/customFetch';

const BIOMETRIC_BEGIN_ENDPOINT = 'payroll/attendance/biometric/begin';
const BIOMETRIC_FINISH_ENDPOINT = 'payroll/attendance/biometric/finish';
const BIOMETRIC_LEGACY_ENDPOINT = 'payroll/attendance/biometric-verify';

type StatusState = {
     variant: 'success' | 'danger' | 'warning' | 'info';
     message: string;
};

type PublicKeyCredentialDescriptorInput = {
     id: string;
     type: PublicKeyCredentialType;
     transports?: AuthenticatorTransport[];
};

type BeginAttendanceData = {
     request_id: string;
     publicKey: {
          challenge: string;
          rpId?: string;
          timeout?: number;
          userVerification?: UserVerificationRequirement;
          allowCredentials?: PublicKeyCredentialDescriptorInput[];
     };
};

type GenericApiResponse = {
     status?: boolean | string | number;
     message?: string;
     error?: string;
     data?: any;
     result?: any;
};

function bytesToBase64Url(bytes: ArrayBuffer): string {
     const array = new Uint8Array(bytes);
     let binary = '';

     for (let i = 0; i < array.length; i += 1) {
          binary += String.fromCharCode(array[i]);
     }

     return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
     const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
     const binary = atob(padded);
     const bytes = new Uint8Array(binary.length);

     for (let i = 0; i < binary.length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
     }

     return bytes.buffer;
}

function randomChallenge(length = 32): ArrayBuffer {
     const buffer = new Uint8Array(length);
     crypto.getRandomValues(buffer);
     return buffer.buffer;
}

function isSuccessfulResponse(response: GenericApiResponse | undefined): boolean {
     if (!response) {
          return false;
     }

     return response.status === true || response.status === 'success' || response.status === 200;
}

function getApiErrorMessage(response: GenericApiResponse | undefined, fallback: string): string {
     if (!response) {
          return fallback;
     }

     if (response.error === 'Session not found') {
          return 'Session not found. Sign in on this device (kiosk account) before biometric attendance.';
     }

     return response.error || response.message || fallback;
}

function extractBeginData(response: GenericApiResponse): BeginAttendanceData | null {
     const source = response?.data || response?.result || response;
     const requestId = source?.request_id || source?.requestId || source?.id;
     const publicKeySource = source?.publicKey || source?.public_key || source;
     const challenge = publicKeySource?.challenge;

     if (!requestId || typeof challenge !== 'string') {
          return null;
     }

     const allowCredentialsInput = publicKeySource?.allowCredentials || publicKeySource?.allow_credentials;
     const allowCredentials = Array.isArray(allowCredentialsInput)
          ? allowCredentialsInput
               .filter((credential: any) => typeof credential?.id === 'string')
               .map((credential: any) => ({
                    id: credential.id,
                    type: (credential.type || 'public-key') as PublicKeyCredentialType,
                    transports: credential.transports,
               }))
          : undefined;

     return {
          request_id: String(requestId),
          publicKey: {
               challenge,
               rpId: publicKeySource?.rpId || publicKeySource?.rp_id,
               timeout: publicKeySource?.timeout,
               userVerification: publicKeySource?.userVerification || publicKeySource?.user_verification,
               allowCredentials,
          },
     };
}

function toPublicKeyRequestOptions(input: BeginAttendanceData['publicKey']): PublicKeyCredentialRequestOptions {
     return {
          challenge: base64UrlToArrayBuffer(input.challenge),
          rpId: input.rpId,
          timeout: input.timeout ?? 60000,
          userVerification: input.userVerification ?? 'required',
          allowCredentials: input.allowCredentials?.map((credential) => ({
               id: base64UrlToArrayBuffer(credential.id),
               type: credential.type,
               transports: credential.transports,
          })),
     };
}

export default function FingerprintVerificationPage() {
     const [isSupported, setIsSupported] = useState(false);
     const [isPlatformAuthenticatorAvailable, setIsPlatformAuthenticatorAvailable] = useState(false);
     const [busyAction, setBusyAction] = useState<'verify' | null>(null);
     const [status, setStatus] = useState<StatusState | null>(null);

     useEffect(() => {
          const supported = typeof window !== 'undefined' && 'PublicKeyCredential' in window && 'credentials' in navigator;
          setIsSupported(supported);

          if (!supported) {
               return;
          }

          PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
               .then((available) => setIsPlatformAuthenticatorAvailable(available))
               .catch(() => setIsPlatformAuthenticatorAvailable(false));
     }, []);

     const canUseFingerprint = useMemo(() => isSupported && isPlatformAuthenticatorAvailable, [isSupported, isPlatformAuthenticatorAvailable]);

     const handleVerifyBiometricAndRegisterAttendance = async () => {
          if (!canUseFingerprint) {
               setStatus({ variant: 'danger', message: 'This browser or device does not support platform biometric verification.' });
               return;
          }

          try {
               setBusyAction('verify');
               setStatus(null);

               const beginResponse = (await customPost(BIOMETRIC_BEGIN_ENDPOINT, 'POST', {})) as GenericApiResponse;
               let beginData = isSuccessfulResponse(beginResponse) ? extractBeginData(beginResponse) : null;

               const usingLegacyFlow = !beginData;

               if (!isSuccessfulResponse(beginResponse) && !usingLegacyFlow) {
                    throw new Error(getApiErrorMessage(beginResponse, 'Unable to initialize biometric attendance challenge.'));
               }

               const assertion = await navigator.credentials.get(
                    usingLegacyFlow
                         ? {
                              publicKey: {
                                   challenge: randomChallenge(),
                                   timeout: 60000,
                                   userVerification: 'required',
                              },
                         }
                         : {
                              publicKey: toPublicKeyRequestOptions((beginData as BeginAttendanceData).publicKey),
                         },
               );

               if (!assertion) {
                    throw new Error('No biometric assertion returned by authenticator.');
               }

               const credential = assertion as PublicKeyCredential;
               const assertionResponse = credential.response as AuthenticatorAssertionResponse;

               const payload = {
                    request_id: beginData?.request_id || null,
                    credential_id: credential.id,
                    raw_id: bytesToBase64Url(credential.rawId),
                    type: credential.type,
                    response: {
                         authenticator_data: bytesToBase64Url(assertionResponse.authenticatorData),
                         client_data_json: bytesToBase64Url(assertionResponse.clientDataJSON),
                         signature: bytesToBase64Url(assertionResponse.signature),
                         user_handle: assertionResponse.userHandle ? bytesToBase64Url(assertionResponse.userHandle) : null,
                    },
                    transports: credential.getClientExtensionResults ? credential.getClientExtensionResults() : {},
                    rp_id: window.location.hostname,
               };

               const response = usingLegacyFlow
                    ? ((await customPost(BIOMETRIC_LEGACY_ENDPOINT, 'POST', payload)) as GenericApiResponse)
                    : ((await customPost(BIOMETRIC_FINISH_ENDPOINT, 'POST', payload)) as GenericApiResponse);

               if (!isSuccessfulResponse(response)) {
                    throw new Error(getApiErrorMessage(response, 'Biometric verified but attendance registration failed.'));
               }

               setStatus({ variant: 'success', message: response?.message || 'Biometric verified and attendance recorded successfully.' });
          } catch (error: unknown) {
               const message = error instanceof Error ? error.message : 'Biometric verification failed.';
               setStatus({ variant: 'danger', message });
          } finally {
               setBusyAction(null);
          }
     };

     return (
          <div className="container-fluid px-4 py-3">
               <div className="border rounded p-3 p-md-4 bg-white">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
                         <div>
                              <h4 className="mb-1 d-flex align-items-center gap-2">
                                   <RiFingerprintLine size={22} className="text-primary" />
                                   Fingerprint Attendance
                              </h4>
                              <p className="text-muted mb-0">Use Windows Hello face or fingerprint verification to register attendance automatically on this shared device.</p>
                         </div>
                         <span className={`badge ${canUseFingerprint ? 'bg-success' : 'bg-secondary'}`}>
                              {canUseFingerprint ? 'Supported' : 'Not Supported'}
                         </span>
                    </div>

                    {!isSupported && (
                         <Alert variant="warning" className="mb-3">
                              This browser does not support WebAuthn. Use a modern browser like Edge or Chrome.
                         </Alert>
                    )}

                    {isSupported && !isPlatformAuthenticatorAvailable && (
                         <Alert variant="warning" className="mb-3">
                              No platform authenticator is available. Ensure Windows Hello face or fingerprint is configured on this device.
                         </Alert>
                    )}

                    {status && (
                         <Alert variant={status.variant} className="mb-3">
                              {status.message}
                         </Alert>
                    )}

                    <div className="row g-3">
                         <div className="col-12">
                              <div className="border rounded p-3">
                                   <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                                        <RiShieldCheckLine size={18} className="text-success" />
                                        Verify Biometric And Register Attendance
                                   </h6>
                                   <p className="text-muted small mb-3">
                                        No password entry is needed. The device authenticator verifies face/fingerprint, then backend identifies the enrolled staff and logs attendance date/time automatically.
                                   </p>
                                   <Button
                                        variant="success"
                                        onClick={handleVerifyBiometricAndRegisterAttendance}
                                        disabled={!canUseFingerprint || busyAction !== null}
                                   >
                                        {busyAction === 'verify' ? (
                                             <>
                                                  <Spinner size="sm" className="me-2" />
                                                  Verifying And Recording Attendance...
                                             </>
                                        ) : (
                                             'Verify Biometric'
                                        )}
                                   </Button>
                              </div>
                         </div>
                    </div>

                    <Alert variant="info" className="mt-3 mb-0">
                         This page uses a two-step WebAuthn flow: begin challenge at {BIOMETRIC_BEGIN_ENDPOINT}, then finish verification at {BIOMETRIC_FINISH_ENDPOINT}.
                    </Alert>
               </div>
          </div>
     );
}
