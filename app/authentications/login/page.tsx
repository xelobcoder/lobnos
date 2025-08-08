'use client'
import styles from './login.module.css';
import { RiShieldCrossFill } from '@remixicon/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Spinner } from 'react-bootstrap';
import { customPost } from '../../../components/Auth/customFetch';

export default function PrimeLabLoginPage() {
	const [isSubmitting, setSubmitting] = useState(false);
	const [isError, setIsError] = useState(false);
	const [message, setMessage] = useState<string>('');
	const router = useRouter();

	const handleLoginBind = async (formData) => {
		try {
			setSubmitting(true);
			const email = formData.get("email");
			const password = formData.get("password");

			// Step 1: Authenticate with backend using customPost
			const backendResponse = await customPost('prime/login', 'POST', { email, password });
			console.log("Backend response:", backendResponse);

			const { status, accessToken, user } = backendResponse;

			if (!status) {
				setIsError(true);
				setMessage(backendResponse.error || 'Login failed');
				return;
			}

			// Step 2: Send authenticated data to Next.js API to set cookies
			const cookieResponse = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status,
					accessToken,
					user,
					email
				}),
			});

			const cookieResult = await cookieResponse.json();

			if (!cookieResponse.ok || !cookieResult.status) {
				setIsError(true);
				setMessage(cookieResult.error || 'Failed to set session');
				return;
			}

			// Step 3: Success - redirect based on role
			setIsError(false);
			setMessage('Login successful. Redirecting...');

			const { role } = cookieResult;
			setTimeout(() => {
				if (role === "admin" || role === "manager") {
					router.push("/");
				} else if (role === "sonographer") {
					router.push("/operations/imaging/");
				} else if (role === "scientist") {
					router.push("/operations/laboratory");
				} else {
					router.push("/notfound");
				}
			}, 1000);

		} catch (err) {
			console.error('Login error:', err);
			setIsError(true);
			setMessage('An error occurred during login');
		} finally {
			setSubmitting(false);
		}
	}
	return (
		<div className={styles.pageWrapper}>
			<header className={styles.pageHeader}>
				<p className={styles.systemNameGlobal}>Prime Laboratory Diagnostic Laboratory Information Management System(PLS-LIMS)</p>
			</header>

			<main className={styles.mainContent}>
				<div className={styles.loginCard}>
					<div className={styles.loginHeader}>
						<RiShieldCrossFill size={56} className={styles.logoIcon} />
						<h1 className={styles.title}>Prime Lab System</h1>
						<p className={styles.subtitle}>Welcome back! Please sign in to your account.</p>
					</div>

					{/* Error display block removed */}
					{isError && <Alert closeLabel='' variant={isError ? "danger" : "success"}>
						<div className='text-sm'>
							{isError  ? message : "Login successful.You would be redirected!!!"}
						</div>
					</Alert>}
					<form action={handleLoginBind} className={styles.loginForm}>
						<div className={styles.formGroup}>
							<label htmlFor="email" className={styles.formLabel}>
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								className={styles.formInput}
								placeholder="you@example.com"
								required
							/>
						</div>

						<div className={styles.formGroup}>
							<label htmlFor="password" className={styles.formLabel}>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								className={styles.formInput}
								placeholder="Enter your password"
								required
							/>
							<div className={styles.forgotPasswordContainer}>
								<a href="#" className={styles.forgotPasswordLink}>
									Forgot password?
								</a>
							</div>
						</div>

						<button type="submit" className={styles.signInButton}>
							{isSubmitting && <Spinner size='sm' />}
							{isSubmitting ? 'signing in' : ' Sign In'}
						</button>
					</form>
				</div>
			</main>

			<footer className={styles.pageFooter}>
				<p>© {new Date().getFullYear()} Prime Lab Systems. All rights reserved.</p>
			</footer>
		</div>
	);
}