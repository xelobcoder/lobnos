'use client';

import { useEffect, useRef } from 'react';

/** Refresh only while the screen is visible; resume immediately when staff return. */
export default function useVisiblePolling(refresh: () => Promise<void>, intervalMs = 15000) {
    const latest = useRef(refresh);
    latest.current = refresh;
    useEffect(() => {
        let running = false;
        const run = async () => {
            if (running || document.visibilityState === 'hidden') return;
            running = true;
            try { await latest.current(); } finally { running = false; }
        };
        void run();
        const timer = window.setInterval(() => void run(), intervalMs);
        document.addEventListener('visibilitychange', run);
        return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', run); };
    }, [refresh, intervalMs]);
}
