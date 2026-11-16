"use client";

import { useState } from "react";

export function useDeveloperTenantSwitch() {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    async function switchTenant(tenantId?: number) {
        setBusy(true);
        setError("");
        try {
            const response = await fetch("/api/auth/developer-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tenantId ? { tenantId } : { action: "return" }),
            });
            const result = await response.json();
            if (!response.ok || result.success !== true) throw new Error(result.error || "The session could not be changed");
            try { localStorage.removeItem("applicationsettings"); }
            catch { /* The authenticated workspace will load its own settings. */ }
            window.location.assign(tenantId ? "/dashboard" : "/master-platform");
        } catch (failure) {
            setError(failure instanceof Error ? failure.message : "The session could not be changed");
            setBusy(false);
        }
    }

    return { switchTenant, busy, error };
}
