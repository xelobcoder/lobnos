"use client";

import { useEffect, useRef } from "react";

/** Refresh only a visible page. Leave background tabs quiet. */
export function useVisibleRefresh(refresh: () => void, enabled = true, interval = 30000) {
    const callback = useRef(refresh);
    useEffect(() => { callback.current = refresh; }, [refresh]);
    useEffect(() => {
        if (!enabled) return;
        const check = () => { if (document.visibilityState === "visible") callback.current(); };
        const timer = window.setInterval(check, interval);
        document.addEventListener("visibilitychange", check);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", check);
        };
    }, [enabled, interval]);
}
