import { RiShieldCrossFill } from "@remixicon/react";
import styles from "./login.module.css";

export default function LoginBranding() {
    return (
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
    );
}
