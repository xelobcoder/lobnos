'use client';
import { useEffect, useRef } from 'react';
const drafts = new Set<symbol>();
let snapshot: {
    url: string;
    state: any;
} | null = null;
function back(event: PopStateEvent) { if (!drafts.size)
    return; if (!window.confirm('Leave this page and discard unsaved clinical changes?')) {
    if (snapshot)
        history.pushState(snapshot.state, '', snapshot.url);
    event.stopImmediatePropagation();
}
else {
    (window as any).__clinicalDiscardApproved = true;
} }
function beforeUnload(event: BeforeUnloadEvent) { if (drafts.size) {
    event.preventDefault();
    event.returnValue = '';
} }
function navigate(event: MouseEvent) { if (!drafts.size || event.button !== 0 || event.metaKey || event.ctrlKey)
    return; const link = (event.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null; if (!link || link.target === '_blank' || link.href === location.href)
    return; if (!window.confirm('Leave this page and discard unsaved clinical changes?')) {
    event.preventDefault();
    event.stopPropagation();
}
else {
    (window as any).__clinicalDiscardApproved = true;
} }
export function useUnsavedClinicalChanges(dirty: boolean) { const key = useRef(Symbol('clinical-draft')); useEffect(() => { if (!dirty)
    return; const first = drafts.size === 0; drafts.add(key.current); (window as any).__clinicalUnsaved = true; if (first) {
    snapshot = { url: location.href, state: history.state };
    window.addEventListener('popstate', back, true);
    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', navigate, true);
} return () => { drafts.delete(key.current); (window as any).__clinicalUnsaved = drafts.size > 0; if (!drafts.size) {
    snapshot = null;
    window.removeEventListener('popstate', back, true);
    window.removeEventListener('beforeunload', beforeUnload);
    document.removeEventListener('click', navigate, true);
} }; }, [dirty]); }
