"use client";

import { type FormEvent, useState } from "react";

export default function MasterCredentialForm({ username }: { username: string }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        if (fields.get("newPassword") !== fields.get("confirmPassword")) {
            setError("The new passwords do not match.");
            return;
        }
        setError("");
        setNotice("");
        setBusy(true);
        try {
            const response = await fetch("/api/auth/master-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "credentials", ...Object.fromEntries(fields) }),
            });
            const result = await response.json();
            if (!response.ok) throw Error(result.error || "Could not update credentials.");
            if (result.changed) window.location.assign("/master-platform/login?changed=1");
            else setNotice("The master credentials are already up to date.");
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : "Could not update credentials.");
        } finally { setBusy(false); }
    }

    return <section className="p-3" style={{ maxWidth: 510 }}>
        <h1 className="h4">Master account</h1>
        <form method="post" onSubmit={submit}>
            <label className="form-label" htmlFor="owner-username">Username</label>
            <input id="owner-username" name="username" autoComplete="username" className="form-control mb-3"
                defaultValue={username} required minLength={3} maxLength={80} />
            <label className="form-label" htmlFor="owner-current-password">Current master password</label>
            <input id="owner-current-password" name="currentPassword" type="password" className="form-control mb-3" autoComplete="current-password" required />
            <label className="form-label" htmlFor="owner-new-password">New password (optional)</label>
            <input id="owner-new-password" name="newPassword" type="password" className="form-control mb-3" autoComplete="new-password" minLength={12} />
            <label className="form-label" htmlFor="owner-confirm-password">Confirm new password</label>
            <input id="owner-confirm-password" name="confirmPassword" type="password" className="form-control mb-3" autoComplete="new-password" />
            <p className="text-muted">Changing your credentials signs out existing master and developer sessions.</p>
            {error && <p className="alert alert-danger" role="alert">{error}</p>}
            {notice && <p className="alert alert-info" role="status">{notice}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>Save credentials</button>
        </form>
    </section>;
}
