'use client'
import styles from './login.module.css';
import { RiShieldCrossFill, RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiHospitalLine, RiStethoscopeLine, RiUserHeartLine } from '@remixicon/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import { customPost } from '../../../components/Auth/customFetch';

const DEVICE_ID_KEY = 'pls-device-id';

/** Stable per-browser id; the server binds the login session to it so only one device stays signed in. */
function getBrowserDeviceId(): string {
	try {
		let deviceId = window.localStorage.getItem(DEVICE_ID_KEY);
		if (!deviceId) {
			deviceId = window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
			window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
		}
		return deviceId;
	} catch {
		return '';
	}
}

export default function PrimeLabLoginPage() {
	const [loginMode, setLoginMode] = useState<'center' | 'doctor' | 'patient'>('center');
	const [isSubmitting, setSubmitting] = useState(false);
	const [loginStatus, setLoginStatus] = useState<'idle' | 'error' | 'success'>('idle');
	const [message, setMessage] = useState<string>('');
	const [userInformation, setUserInformation] = useState({ username: '', password: '' });
	const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'reset' | null>(null);
	const [recoveryUsername, setRecoveryUsername] = useState('');
	const [recoveryEmail, setRecoveryEmail] = useState('');
	const [recoveryOtp, setRecoveryOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [recoveryBusy, setRecoveryBusy] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const loginModes = [
		{ key: 'center' as const, label: 'Center Login', icon: RiHospitalLine, description: 'For laboratory and administrative teams' },
		{ key: 'doctor' as const, label: 'Doctor Login', icon: RiStethoscopeLine, description: 'For doctors and clinical partners' },
		{ key: 'patient' as const, label: 'Patient Login', icon: RiUserHeartLine, description: 'Access your results and care information' },
	];
	const activeLoginMode = loginModes.find((mode) => mode.key === loginMode)!;

	const handleLoginBind = async () => {
		try {
			setSubmitting(true);
			setLoginStatus('idle');
			setMessage('');

			const username = userInformation.username.trim();
			const password = userInformation.password;
			if (!username || !password) {
				setLoginStatus('error');
				setMessage('Enter your username and password');
				setSubmitting(false);
				return;
			}
			const usernameParts = username.match(/^([A-Z][A-Z0-9]{2,31})([SCP])(\d{1,9})$/i);
			if (!usernameParts || Number(usernameParts[3]) === 0) {
				setLoginStatus('error');
				setMessage('Use your organization identifier, S/C/P, and account ID (for example, PLS20154S004).');
				setSubmitting(false);
				return;
			}

			let browserInfo = {};
			if (typeof window !== 'undefined') {
				const nav = window.navigator;
				browserInfo = {
					deviceId: getBrowserDeviceId(),
					userAgent: nav.userAgent || '',
					platform: nav.platform || '',
					device: /Mobi|Android/i.test(nav.userAgent) ? 'mobile' : 'computer',
					connectionType: (nav as any)?.connection?.effectiveType || '',
					deviceMemory: (nav as any)?.deviceMemory || '',
					language: nav.language || '',
					languages: nav.languages || [],
					vendor: nav.vendor || '',
					hardwareConcurrency: nav.hardwareConcurrency || '',
					cookieEnabled: nav.cookieEnabled,
					online: nav.onLine,
					product: nav.product || '',
					appVersion: nav.appVersion || '',
					appName: nav.appName || '',
					maxTouchPoints: nav.maxTouchPoints || 0,
				};
			}

			const endpoint = loginMode === 'center' ? 'prime/login' : loginMode === 'doctor' ? 'login/clinician' : 'login/patient';
			const backendResponse = await customPost(endpoint, 'POST', {
				username,
				password,
				browserInfo,
			}, false, true);

			if (!backendResponse) {
				setLoginStatus('error');
				setMessage('Unable to reach the server. Please try again.');
				setSubmitting(false);
				return;
			}

			if (backendResponse.status === "error" &&
				(backendResponse.message === "License expired or invalid" || backendResponse.message === "License vaalidation failed" ||
					backendResponse.message === "License not found"
				)) {
				router.push("/authentications/license-expired");
				return;
			}


			const { status, accessToken, token, user, settings, sessionExpiryTime, loginsessionId } = backendResponse;

			if (!status || status == false || status === 'error') {
				setLoginStatus('error');
				setMessage(backendResponse.error || backendResponse.message || 'Login failed');
				setSubmitting(false);
				return;
			}

			// Use the internal tenant ID resolved by the server from the public organization prefix.
			const resolvedTenantId = Number(backendResponse.tenantId ?? user?.tenantId);
			if (!Number.isSafeInteger(resolvedTenantId) || resolvedTenantId <= 0) {
				setLoginStatus('error');
				setMessage('Unable to determine your organization. Please contact your administrator.');
				setSubmitting(false);
				return;
			}



			const cookieResponse = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status,
					accessToken: accessToken || token,
					user,
					email: user?.email || username,
					browserInfo,
					sessionExpiryTime: sessionExpiryTime || Date.now() + (12 * 60 * 60 * 1000), loginsessionId,
					settings,
					tenantId: resolvedTenantId,
				}),
			});

			const cookieResult = await cookieResponse.json();

			if (!cookieResponse.ok || !cookieResult.status) {
				setLoginStatus('error');
				setMessage(cookieResult.error || 'Failed to set session');
				setSubmitting(false);
				return;
			}

			if (typeof window !== 'undefined') {
				const contextResponse = await fetch('/api/auth/context-retrieval', {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
					signal: AbortSignal.timeout(10000),
					headers: { 'Content-Type': 'application/json' },
				});
				const contextData = await contextResponse.json();
				if (!contextResponse.ok || !contextData?.user || Number(contextData.tenantId) !== resolvedTenantId) {
					throw new Error(contextData?.error || 'Your browser did not retain the login session. Please try again.');
				}
				try {
					localStorage.setItem('applicationsettings', JSON.stringify({
						user: contextData.user,
						settings: contextData.settings || {},
						tenantId: contextData.tenantId,
					}));
				} catch (error) {
					console.warn('Application settings could not be cached; they will be loaded from the server.', error);
				}
			}

			setLoginStatus('success');
			setMessage('Login successful. Redirecting...');
			const { role } = cookieResult;
			const destinations: Record<string, string> = {
				patient: '/patientportal',
				clinician: '/doctor',
				'customer service representative': '/crm/overview',
				admin: '/analytics',
				manager: '/',
				sonographer: '/operations/imaging/ultrasound',
				scientist: '/operations/laboratory',
				storekeeper: '/inventory',
				accountant: '/accounting',
			};
			const destination = String(role || '').toLowerCase().replace(/[\s_-]/g, '') === 'superadmin'
				? '/settings/facilities'
				: destinations[role] || '/';
			// Reload the authenticated shell rather than reusing the anonymous router cache.
			window.location.replace(destination);

		} catch (err) {
			console.error('Login error:', err);
			setLoginStatus('error');
			setMessage(err instanceof Error && err.name === 'TimeoutError'
				? 'Session verification timed out. Please try logging in again.'
				: err instanceof Error ? err.message : 'An error occurred during login');
			setSubmitting(false);
		}
	}

	const handleRequestPasswordReset = async () => {
		if (!/^[A-Z][A-Z0-9]{2,31}[SCP]\d{1,9}$/i.test(recoveryUsername.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())) {
			setLoginStatus('error');
			setMessage('Enter your full username and registered email address.');
			return;
		}

		try {
			setRecoveryBusy(true);
			setLoginStatus('idle');
			const result = await customPost('prime/forgotpassword', 'POST', {
				username: recoveryUsername.trim(),
				email: recoveryEmail.trim(),
			}, false, true);
			if (!result || result.status === 'error' || result.statusCode >= 400) {
				throw new Error(result?.message || 'Could not request a verification code. Please try again.');
			}
			setRecoveryStep('verify');
			setLoginStatus('success');
			setMessage(result.message || 'If the account and email address are registered, verification instructions will be sent.');
		} catch (error) {
			setLoginStatus('error');
			setMessage(error instanceof Error ? error.message : 'Could not request a verification code. Please try again.');
		} finally {
			setRecoveryBusy(false);
		}
	};

	const handleVerifyRecoveryOtp = async () => {
		if (!/^\d{6}$/.test(recoveryOtp)) {
			setLoginStatus('error');
			setMessage('Enter the six-digit verification code.');
			return;
		}
		try {
			setRecoveryBusy(true);
			setLoginStatus('idle');
			const result = await customPost('prime/verify-reset-otp', 'POST', {
				username: recoveryUsername.trim(),
				otp: recoveryOtp,
			}, false, true);
			if (!result || result.status !== 'success' || result.verified !== true) {
				throw new Error(result?.message || 'Invalid or expired verification code.');
			}
			setRecoveryStep('reset');
			setLoginStatus('success');
			setMessage('Code verified. Choose a new password.');
		} catch (error) {
			setLoginStatus('error');
			setMessage(error instanceof Error ? error.message : 'Could not verify the code. Please try again.');
		} finally {
			setRecoveryBusy(false);
		}
	};

	const handleResetPassword = async () => {
		if (newPassword.length < 8) {
			setLoginStatus('error');
			setMessage('Your new password must be at least 8 characters long.');
			return;
		}
		try {
			setRecoveryBusy(true);
			setLoginStatus('idle');
			const result = await customPost('prime/resetpassword', 'POST', {
				username: recoveryUsername.trim(),
				otp: recoveryOtp,
				password: newPassword,
			}, false, true);
			if (!result || result.status !== 'success') {
				throw new Error(result?.message || 'Password reset failed. Please try again.');
			}
			setRecoveryStep(null);
			setRecoveryOtp('');
			setNewPassword('');
			setUserInformation({ username: recoveryUsername.trim(), password: '' });
			setLoginStatus('success');
			setMessage('Password reset successfully. You can now sign in.');
		} catch (error) {
			setLoginStatus('error');
			setMessage(error instanceof Error ? error.message : 'Password reset failed. Please try again.');
		} finally {
			setRecoveryBusy(false);
		}
	};

	const handleForgotPasswordClick = () => {
		setRecoveryStep('request');
		setRecoveryUsername(userInformation.username.trim());
		setRecoveryEmail('');
		setLoginStatus('idle');
		setMessage('');
	};

	const handleBackToSignIn = () => {
		setRecoveryStep(null);
		setRecoveryOtp('');
		setNewPassword('');
		setRecoveryUsername('');
		setRecoveryEmail('');
		setLoginStatus('idle');
		setMessage('');
	};

	return (
		<div className={styles.splitLayout}>
			{/* Left side - Branding */}
			<div className={styles.brandingSide}>
				<div className={styles.brandOverlay}>
					<div className={styles.brandContent}>
						<div className={styles.brandLogo}>
							<RiShieldCrossFill size={48} className={styles.logoIcon} />
							<span className={styles.brandTitle}>Prime Laboratory Software (PLS)</span>
						</div>
						<div className={styles.brandText}>
							<h1 className={styles.heroTitle}>Advanced Laboratory Management System</h1>
							<p className={styles.heroSubtitle}>
								Streamline your laboratory operations, enhance patient care, and drive efficiency with our comprehensive LIMS solution.
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Right side - Login Form */}
			<div className={styles.formSide}>
				<div className={styles.formContainer}>
					<div className={styles.loginHeader}>
						<h2 className={styles.welcomeTitle}>Welcome back</h2>
						<p className={styles.welcomeSubtitle}>{activeLoginMode.description}</p>
					</div>

					<div className={styles.loginModeSelector} role="tablist" aria-label="Choose account type">
						{loginModes.map((mode) => {
							const ModeIcon = mode.icon;
							return (
								<button
									key={mode.key}
									type="button"
									role="tab"
									aria-selected={loginMode === mode.key}
									className={`${styles.loginModeButton} ${loginMode === mode.key ? styles.activeLoginMode : ''}`}
									disabled={isSubmitting || recoveryBusy || recoveryStep !== null}
									onClick={() => setLoginMode(mode.key)}
								>
									<ModeIcon size={18} />
									<span>{mode.label}</span>
								</button>
							);
						})}
					</div>
					{loginStatus !== 'idle' && (
						<Alert variant={loginStatus === 'error' ? "danger" : "success"} className="mb-4 border-0 shadow-sm">
							<div className='text-sm font-medium'>
								{message}
							</div>
						</Alert>
					)}

					{recoveryStep ? (
						<form className={styles.loginForm} onSubmit={(event) => {
							event.preventDefault();
							if (recoveryStep === 'request') void handleRequestPasswordReset();
							else if (recoveryStep === 'verify') void handleVerifyRecoveryOtp();
							else void handleResetPassword();
						}}>
							<p className={styles.recoveryInstructions}>
								{recoveryStep === 'request'
									? 'Enter your full username and registered email. The username selects your organization; no global user list is needed.'
									: recoveryStep === 'verify'
										? 'Enter the six-digit code sent to the email address on your account.'
										: 'Set a new password for your account.'}
							</p>
							{recoveryStep === 'request' && (
								<>
									<div className={styles.formGroup}>
										<label htmlFor="recoveryEmail" className={styles.formLabel}>Registered email</label>
										<input
											id="recoveryEmail"
											name="email"
											type="email"
											autoComplete="email"
											value={recoveryEmail}
											onChange={(event) => setRecoveryEmail(event.target.value)}
											className={styles.formInput}
											placeholder="Enter your account email"
											required
										/>
									</div>
									<div className={styles.formGroup}>
										<label htmlFor="recoveryUsername" className={styles.formLabel}>Username</label>
										<input
											id="recoveryUsername"
											name="username"
											type="text"
											value={recoveryUsername}
											onChange={(event) => setRecoveryUsername(event.target.value)}
											className={styles.formInput}
											placeholder="e.g. PLS20154S004"
											pattern="[A-Za-z][A-Za-z0-9]{2,31}[SsCcPp]\d{1,9}"
											required
										/>
									</div>
								</>
							)}
							{recoveryStep === 'verify' && (
								<div className={styles.formGroup}>
									<label htmlFor="recoveryOtp" className={styles.formLabel}>Verification code</label>
									<input
										id="recoveryOtp"
										name="otp"
										type="text"
										inputMode="numeric"
										autoComplete="one-time-code"
										maxLength={6}
										value={recoveryOtp}
										onChange={(event) => setRecoveryOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
										className={styles.formInput}
										placeholder="Enter the 6-digit code"
										required
									/>
								</div>
							)}
							{recoveryStep === 'reset' && (
								<div className={styles.formGroup}>
									<label htmlFor="newPassword" className={styles.formLabel}>New password</label>
									<input
										id="newPassword"
										name="newPassword"
										type="password"
										autoComplete="new-password"
										value={newPassword}
										onChange={(event) => setNewPassword(event.target.value)}
										className={styles.formInput}
										placeholder="At least 8 characters"
										required
									/>
								</div>
							)}
							<button
								type="submit"
								className={styles.signInButton}
								disabled={recoveryBusy}
							>
								{recoveryBusy && <Spinner size="sm" animation="border" role="status" aria-hidden="true" className="me-2" />}
								<span>{recoveryBusy ? 'Please wait...' : recoveryStep === 'request' ? 'Send verification code' : recoveryStep === 'verify' ? 'Verify code' : 'Reset password'}</span>
							</button>
							{recoveryStep === 'verify' && (
								<button type="button" className={styles.secondaryButton} disabled={recoveryBusy} onClick={handleRequestPasswordReset}>
									Send a new code
								</button>
							)}
							<button type="button" className={styles.secondaryButton} disabled={recoveryBusy} onClick={handleBackToSignIn}>
								Back to sign in
							</button>
						</form>
					) : (
					<form className={styles.loginForm} onSubmit={(event) => { event.preventDefault(); void handleLoginBind(); }}>
						<div className={styles.formGroup}>
							<label htmlFor="username" className={styles.formLabel}>
								Username
							</label>
							<div className={styles.inputWrapper}>
								{loginMode === 'patient' ? <RiUserHeartLine size={20} className={styles.inputIcon} /> : <RiUserLine size={20} className={styles.inputIcon} />}
								<input
									id="username"
									name="username"
									type="text"
									value={userInformation.username}
									onChange={(e) => setUserInformation({ ...userInformation, username: e.target.value })}
									className={styles.formInput}
									placeholder={loginMode === 'center' ? 'e.g. PLS20154S004' : loginMode === 'doctor' ? 'e.g. PLS20154C004' : 'e.g. PLS20154P004'}
									pattern="[A-Za-z][A-Za-z0-9]{2,31}[SsCcPp]\d{1,9}"
									title="Organization identifier + S, C, or P + your account ID"
									required
									autoComplete="username"
								/>
							</div>
						</div>

						<div className={styles.formGroup}>
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label htmlFor="password" className={styles.formLabel}>
									Password
								</label>
								<button type="button" className={styles.forgotPasswordLink} disabled={isSubmitting} onClick={handleForgotPasswordClick}>
									Forgot password?
								</button>
							</div>
							<div className={styles.inputWrapper}>
								<RiLockLine size={20} className={styles.inputIcon} />
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									className={styles.formInput}
									placeholder="Enter your password"
									value={userInformation.password}
									onChange={(e) => setUserInformation({ ...userInformation, password: e.target.value })}
									required
									autoComplete="current-password"
								/>
								<button
									type="button"
									className={styles.passwordToggle}
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
								</button>
							</div>
						</div>

						<button type="submit" className={styles.signInButton} disabled={isSubmitting}>
							{isSubmitting && <Spinner size='sm' animation="border" role="status" aria-hidden="true" className="me-2" />}
							<span>
								{isSubmitting
									? (loginStatus === 'success' ? 'Redirecting...' : 'Signing in...')
									: 'Sign In Using Secure Server'}
							</span>
						</button>
					</form>
					)}

					<div className={styles.footer}>
						<p>© {new Date().getFullYear()} Prime Laboratory Software. All rights reserved.</p>
					</div>
				</div>
			</div>
		</div>
	);
}