import Link from "next/link";
import LoginBranding from "../../authentications/login/LoginBranding";
import MasterPasswordInput from "./MasterPasswordInput";
import { RiUserLine } from "@remixicon/react";
import styles from "../../authentications/login/login.module.css";

export default async function MasterLogin({ searchParams }: { searchParams: Promise<{ error?: string; changed?: string }> }) {
    const { error, changed } = await searchParams;
    return <main className={styles.splitLayout}>
        <LoginBranding />
        <section className={styles.formSide} aria-labelledby="master-login-heading">
            <div className={styles.formContainer}>
                <nav className={styles.entryLinks} aria-label="Sign-in navigation"><Link href="/">← Website</Link><Link href="/facility-login">Login options</Link></nav>
                <div className={styles.loginHeader}>
                    <h2 id="master-login-heading" className={styles.welcomeTitle}>Welcome back</h2>
                    <p className={styles.welcomeSubtitle}>Sign in to Platform Administration.</p>
                </div>
                <form method="post" action="/api/auth/master-session" className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="master-username">Master username</label>
                        <div className={styles.inputWrapper}>
                            <RiUserLine className={styles.inputIcon} size={20} />
                            <input className={styles.formInput} id="master-username" name="username" autoComplete="username" autoCapitalize="none" placeholder="Enter your master username" required />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="master-password">Master password</label>
                        <MasterPasswordInput />
                    </div>
                    {changed === "1" && <p className="alert alert-success" role="status">Credentials updated. Sign in with your new credentials.</p>}
                    {error && <p className="alert alert-danger" role="alert">{
                        error === "invalid" ? "Invalid master username or password." :
                        error === "rate" ? "Too many attempts. Try again later." : "Master sign-in is unavailable. Try again."
                    }</p>}
                    <button className={styles.signInButton} type="submit">Sign in to master platform</button>
                </form>
                <div className={styles.footer}>
                    <p>© {new Date().getFullYear()} Prime Laboratory Software. All rights reserved.</p>
                </div>
            </div>
        </section>
    </main>;
}
