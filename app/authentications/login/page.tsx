'use client'
import styles from './login.module.css';
import { RiShieldCrossFill, RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiHospitalLine, RiStethoscopeLine, RiUserHeartLine } from '@remixicon/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import { customPost } from '../../../components/Auth/customFetch';

export default function PrimeLabLoginPage() {
	const [loginMode, setLoginMode] = useState<'center' | 'doctor' | 'patient'>('center');
	const [isSubmitting, setSubmitting] = useState(false);
	const [loginStatus, setLoginStatus] = useState<'idle' | 'error' | 'success'>('idle');
	const [message, setMessage] = useState<string>('');
	const [userInformation, setUserInformation] = useState({ username: '', password: '' });
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const loginModes = [
		{ key: 'center' as const, label: 'Center Login', icon: RiHospitalLine, description: 'For laboratory and administrative teams' },
		{ key: 'doctor' as const, label: 'Doctor Login', icon: RiStethoscopeLine, description: 'For doctors and clinical partners' },
		{ key: 'patient' as const, label: 'Patient Login', icon: RiUserHeartLine, description: 'Access your results and care information' },
	];
	const activeLoginMode = loginModes.find((mode) => mode.key === loginMode)!;

	const handleLoginBind = async (formData) => {
		try {
			setSubmitting(true);
			setLoginStatus('idle');
			setMessage('');

			const username = userInformation.username;
			const password = userInformation.password;

			let browserInfo = {};
			if (typeof window !== 'undefined') {
				const nav = window.navigator;
				browserInfo = {
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
			const backendResponse = await customPost(endpoint, 'POST', { username, password, browserInfo }, false, true);

			if (backendResponse.status === "error" &&
				(backendResponse.message === "License expired or invalid" || backendResponse.message === "License vaalidation failed" ||
					backendResponse.message === "License not found"
				)) {
				router.push("/authentications/license-expired");
				return;
			}


			const { status, accessToken, token, user, settings, sessionExpiryTime, loginsessionId } = backendResponse;

			if (!status || status == false) {
				setLoginStatus('error');
				setMessage(backendResponse.error || backendResponse.message || 'Login failed');
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
					settings
				}),
			});

			const cookieResult = await cookieResponse.json();

			if (!cookieResponse.ok || !cookieResult.status) {
				setLoginStatus('error');
				setMessage(cookieResult.error || 'Failed to set session');
				setSubmitting(false);
				return;
			}

			setLoginStatus('success');
			setMessage('Login successful. Redirecting...');

			if (typeof window !== 'undefined') {
				localStorage.removeItem('applicationsettings');
			}

			const { role } = cookieResult;
			setTimeout(() => {
				if (role === "patient") {
					router.push("/patientportal");
				} else if (role === "clinician") {
					router.push("/doctor");
				} else
					if (role === "customer service representative") {
						router.push("/crm/overview");
					} else if (role === 'admin') {
						router.push("/analytics");
					} else if (role === 'manager') {
						router.push("/");
					} else if (role === "sonographer") {
						router.push("/operations/imaging/ultrasound");
					} else if (role === "scientist") {
						router.push("/operations/laboratory");
					} else if (role === "storekeeper") {
						router.push("/inventory");
					} else if (role === "accountant") {
						router.push("/accounting");
					}
					else {
						router.push("/");
					}
			}, 1000);

		} catch (err) {
			console.error('Login error:', err);
			setLoginStatus('error');
			setMessage('An error occurred during login');
			setSubmitting(false);
		}
	}
	return (
		<div className={styles.splitLayout}>
			{/* Left side - Branding */}
			<div className={styles.brandingSide}>
				<div className={styles.brandOverlay}>
					<div className={styles.brandContent}>
						<div className={styles.brandLogo}>
							<RiShieldCrossFill size={48} className={styles.logoIcon} />
							<span className={styles.brandTitle}>Prime Lab System (PLS)</span>
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

					<form className={styles.loginForm}>
						<div className={styles.formGroup}>
							<label htmlFor="username" className={styles.formLabel}>
								{loginMode === 'center' ? 'Center Username' : loginMode === 'doctor' ? 'Doctor Username' : 'Patient Username'}
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
									placeholder={loginMode === 'center' ? 'Enter your center username' : loginMode === 'doctor' ? 'Enter your doctor username' : 'Enter your patient username'}
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
								<a href="#" className={styles.forgotPasswordLink}>
									Forgot password?
								</a>
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

						<button type="button" className={styles.signInButton} disabled={isSubmitting} onClick={handleLoginBind}>
							{isSubmitting && <Spinner size='sm' animation="border" role="status" aria-hidden="true" className="me-2" />}
							<span>
								{isSubmitting
									? (loginStatus === 'success' ? 'Redirecting...' : 'Signing in...')
									: 'Sign In Using Secure Server'}
							</span>
						</button>
					</form>

					<div className={styles.footer}>
						<p>© {new Date().getFullYear()} Prime Laboratory System. All rights reserved.</p>
					</div>
				</div>
			</div>
		</div>
	);
}