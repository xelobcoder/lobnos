'use client'
import styles from './login.module.css';
import { RiShieldCrossFill } from '@remixicon/react';
import { handleUserLogin } from '../../../components/serverActions/ActionFiltering';
import { useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';

export default function PrimeLabLoginPage() {
	const [isSubmitting, setSubmitting] = useState(false);
	const [isError, setIsError] = useState(false);
	const [message, setMessage] = useState<string>('');

	const handleLoginBind = async (formData) => {
		try {
			setSubmitting(true)
			const response = await handleUserLogin(formData);
			const { status, message,error } = response;
			!status && setIsError(true);
			!status && setMessage(error);
			return response;
		} catch (err) {
			console.log('Error');
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