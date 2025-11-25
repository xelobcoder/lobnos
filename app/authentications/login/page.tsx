'use client'
import styles from './login.module.css';
import { RiShieldCrossFill, RiMailLine, RiLockLine, RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import { customPost } from '../../../components/Auth/customFetch';

export default function PrimeLabLoginPage() {
	const [isSubmitting, setSubmitting] = useState(false);
	const [loginStatus, setLoginStatus] = useState<'idle' | 'error' | 'success'>('idle');
	const [message, setMessage] = useState<string>('');
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const handleLoginBind = async (formData) => {
		try {
			setSubmitting(true);
			setLoginStatus('idle');
			setMessage('');

			const email = formData.get("email");
			const password = formData.get("password");


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

			const backendResponse = await customPost('prime/login', 'POST', { email, password, browserInfo });

			const { status, accessToken, user } = backendResponse;

			if (!status) {
				setLoginStatus('error');
				setMessage(backendResponse.error || 'Login failed');
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
					accessToken,
					user,
					email,
					browserInfo
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
			// Keep submitting true to show loading state during redirect

			if (typeof window !== 'undefined') {
				localStorage.removeItem('applicationsettings');
			}

			const { role } = cookieResult;
			setTimeout(() => {
				if (role === "admin" || role === "manager" || role == "customer service representative") {
					router.push("/");
				} else if (role === "sonographer") {
					router.push("/operations/imaging/ultrasound");
				} else if (role === "scientist") {
					router.push("/operations/laboratory");
				} else {
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
						<h2 className={styles.welcomeTitle}>Welcome Back</h2>
						<p className={styles.welcomeSubtitle}>Sign in to your account to continue</p>
					</div>

					{loginStatus !== 'idle' && (
						<Alert variant={loginStatus === 'error' ? "danger" : "success"} className="mb-4 border-0 shadow-sm">
							<div className='text-sm font-medium'>
								{message}
							</div>
						</Alert>
					)}

					<form action={handleLoginBind} className={styles.loginForm}>
						<div className={styles.formGroup}>
							<label htmlFor="email" className={styles.formLabel}>
								Email Address
							</label>
							<div className={styles.inputWrapper}>
								<RiMailLine size={20} className={styles.inputIcon} />
								<input
									id="email"
									name="email"
									type="email"
									className={styles.formInput}
									placeholder="name@company.com"
									required
									autoComplete="email"
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
									: 'Sign In'}
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