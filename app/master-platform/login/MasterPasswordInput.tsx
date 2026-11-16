"use client";

import { useState } from "react";
import { RiEyeLine, RiEyeOffLine, RiLockLine } from "@remixicon/react";
import styles from "../../authentications/login/login.module.css";

export default function MasterPasswordInput() {
    const [visible, setVisible] = useState(false);
    return <div className={styles.inputWrapper}>
        <RiLockLine className={styles.inputIcon} size={20} aria-hidden="true" />
        <input className={styles.formInput} id="master-password" name="password"
            type={visible ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" required />
        <button className={styles.passwordToggle} type="button" aria-label={visible ? "Hide password" : "Show password"}
            onClick={() => setVisible(!visible)}>
            {visible ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
        </button>
    </div>;
}
