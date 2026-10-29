"use client";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Modal from 'react-bootstrap/Modal';
import styles from './PayrollScreens.module.css';

/** Form-only interaction protection, matching the billing strategy editor. */
export default function PayrollFormFrame({ children, className, busy = false }: { children: ReactNode; className?: string; busy?: boolean }) {
 const router = useRouter(), root = useRef<HTMLDivElement>(null);
 const pendingBack = useRef<HTMLButtonElement | null>(null), bypass = useRef(false);
 const [dirty, setDirty] = useState(false), [destination, setDestination] = useState<string | null>(null);
 useEffect(() => {
  if (!dirty && !busy) return;
  const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
  window.addEventListener('beforeunload', warn);
  return () => window.removeEventListener('beforeunload', warn);
 }, [dirty, busy]);
 useEffect(() => {
  let previous = '';
  const announce = () => {
   const alert = root.current?.querySelector<HTMLElement>('[role="alert"]');
   const message = alert?.textContent?.trim() || '';
   if (alert && message && message !== previous) { alert.tabIndex = -1; alert.focus(); }
   previous = message;
  };
  const observer = new MutationObserver(announce);
  if (root.current) observer.observe(root.current, { childList: true, characterData: true, subtree: true });
  announce(); return () => observer.disconnect();
 }, []);
 function navigate(event: MouseEvent<HTMLDivElement>) {
  if (bypass.current) return;
  const back = (event.target as Element).closest<HTMLButtonElement>('button[data-payroll-back]');
  if (back && (dirty || busy)) {
   event.preventDefault(); event.stopPropagation();
   if (!busy) { pendingBack.current = back; setDestination('#back'); }
   return;
  }
  const anchor = (event.target as Element).closest('a[href]') as HTMLAnchorElement | null;
  if (!anchor || !root.current?.contains(anchor) || anchor.target === '_blank' || anchor.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin || url.href === window.location.href || anchor.getAttribute('href')?.startsWith('#')) return;
  if (busy) { event.preventDefault(); event.stopPropagation(); return; }
  if (!dirty) return;
  event.preventDefault(); event.stopPropagation(); pendingBack.current = null; setDestination(url.pathname + url.search + url.hash);
 }
 return <div ref={root} className={className} aria-busy={busy} onChangeCapture={event => { if (!(event.target as Element).hasAttribute('data-payroll-transient')) setDirty(true); }} onClickCapture={navigate}>
  {children}
  <p className={styles.formStatus} role="status">{busy ? 'Saving your changes…' : dirty ? 'You have unsaved changes.' : 'No unsaved changes.'}</p>
  <Modal show={destination !== null} onHide={() => setDestination(null)} centered aria-labelledby="payroll-unsaved-title">
   <Modal.Header><Modal.Title id="payroll-unsaved-title" className="h5">You have unsaved changes</Modal.Title></Modal.Header>
   <Modal.Body>Keep editing to save your changes, or discard them and leave this form.</Modal.Body>
   <Modal.Footer><button type="button" className="btn btn-outline-secondary" onClick={() => setDestination(null)}>Keep editing</button><button type="button" className="btn btn-danger" onClick={() => { const href = destination, back = pendingBack.current; pendingBack.current = null; setDirty(false); setDestination(null); if (back) { bypass.current = true; back.click(); bypass.current = false; } else if (href) router.push(href); }}>Discard & leave</button></Modal.Footer>
  </Modal>
 </div>;
}
