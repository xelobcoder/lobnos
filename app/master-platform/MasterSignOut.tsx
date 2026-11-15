"use client";

import { useState } from "react";

export default function MasterSignOut() {
    const [error, setError] = useState("");
    async function signOut() {
        try {
            const result = await fetch("/api/auth/master-session", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }),
            });
            if (!result.ok) throw Error("Master sign-out could not be confirmed.");
            window.location.assign("/master-platform/login");
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : "Sign-out could not be confirmed.");
        }
    }
    return <div><button className="btn btn-sm btn-outline-secondary" onClick={() => void signOut()}>Sign out of master</button>
        {error && <p role="alert">{error}</p>}</div>;
}
