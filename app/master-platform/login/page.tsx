import { RiLockLine, RiShieldCrossFill, RiUserLine } from "@remixicon/react";
import styles from "../../authentications/login/login.module.css";

export default async function MasterLogin({ searchParams }: { searchParams: Promise<{ error?: string; changed?: string }> }) {
    const { error, changed } = await searchParams;
    return <main className={styles.splitLayout}>
        <aside className={styles.brandingSide}>
            <div className={styles.brandOverlay} />
            <div className={styles.brandContent}>
                <div className={styles.brandLogo}><RiShieldCrossFill size={48} /><span className={styles.brandTitle}>Prime Laboratory Software</span></div>
                <h1 className={styles.heroTitle}>Platform Administration</h1>
            </div>
        </aside>
        <section className={styles.formSide} aria-labelledby="master-login-heading">
            <div className={styles.formContainer}>
                <h2 id="master-login-heading" className={styles.welcomeTitle}>Platform administrator sign-in</h2>
                <form method="post" action="/api/auth/master-session" className={styles.loginForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="master-username">Master username</label>
                        <div className={styles.inputWrapper}>
                            <RiUserLine className={styles.inputIcon} size={20} />
                            <input className={styles.formInput} id="master-username" name="username" autoComplete="username" autoCapitalize="none" required />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} htmlFor="master-password">Master password</label>
                        <div className={styles.inputWrapper}>
                            <RiLockLine className={styles.inputIcon} size={20} />
                            <input className={styles.formInput} id="master-password" name="password" type="password" autoComplete="current-password" required />
                        </div>
                    </div>
                    {changed === "1" && <p className="alert alert-success" role="status">Credentials updated. Sign in with your new credentials.</p>}
                    {error && <p className="alert alert-danger" role="alert">{
                        error === "invalid" ? "Invalid master username or password." :
                        error === "rate" ? "Too many attempts. Try again later." : "Master sign-in is unavailable. Try again."
                    }</p>}
                    <button className={styles.signInButton} type="submit">Sign in to master platform</button>
                </form>
            </div>
        </section>
    </main>;
}
