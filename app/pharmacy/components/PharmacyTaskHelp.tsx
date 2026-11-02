'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { articleHref, learningArticles, resolvePharmacyGuideSlug } from '../../../lib/pharmacyLearning';
import help from './PharmacyTaskHelp.module.css';

type WalkStep = { selector: string; text?: string; title: string; explanation: string };
const tours: Record<string, WalkStep[]> = {
  'create-purchase-request': [
    { selector: 'button', text: '1. Submit purchase request', title: 'Start a purchase request', explanation: 'This opens the request form. You may open it yourself; this guide will not click or submit anything.' },
    { selector: 'select[name="supplier"]', title: 'Choose the supplier', explanation: 'After you open the form, choose the supplier quotation to request. Add medicines using the picker. Nothing has been ordered yet.' },
    { selector: 'input[name="notes"]', title: 'Check quantities and explain why', explanation: 'Enter quantities and quoted costs in base units. Give a clear reason. Two boxes of 20 tablets means 40 tablets.' },
    { selector: 'form button', text: 'Submit purchase request', title: 'Review before submitting', explanation: 'Stop and check the supplier, units and costs. Only your own deliberate submission sends the request for independent approval. You can dismiss this guide without saving.' },
  ],
  'receive-delivery': [
    { selector: 'button', text: 'Receive stock', title: 'Choose how the delivery arrived', explanation: 'For an approved order, use Purchase orders and Receive against order. For an unordered delivery, you may open Receive stock yourself.' },
    { selector: 'button', text: 'Purchase orders', title: 'Identify the original delivery', explanation: 'Use the exact order line where available, or choose the medicine for a direct receipt. This guide never selects a medicine for you.' },
    { selector: 'input[name="quantity"], form:has(input[placeholder="Leave blank to generate"]) input[step="0.001"]', title: 'Check units, cost, batch and expiry', explanation: 'After you open the receipt form, check the actual quantity received and the required batch/expiry evidence. A partial delivery must not receive the full order.' },
    { selector: 'form:has(input[name="quantity"]) button:not([type="button"]), form:has(input[placeholder="Leave blank to generate"]) button:not([type="button"])', title: 'Confirm only the real delivery', explanation: 'Review the stock and cost effect before manually saving. A receipt adds stock, not a supplier payment. This guide will not press the button.' },
  ],
  'record-expense': [
    { selector: 'summary', text: 'New expense draft', title: 'Open a draft', explanation: 'You may open New expense draft. This is for running costs, not medicine stock.' },
    { selector: 'input[name="description"]', title: 'Describe the cost', explanation: 'After opening the draft, enter the real cost description and amount. Choose the correct expense account.' },
    { selector: 'select[name="supplierId"]', title: 'Check supplier and date', explanation: 'Select the actual supplier and financial date. Only enter a due date supported by the supplier evidence.' },
    { selector: 'form button', text: 'Save expense draft', title: 'Review before saving', explanation: 'Saving creates a draft, not a payment. It still needs submission and independent approval. This guide never saves or posts it for you.' },
  ],
  'customer-balances': [
    { selector: 'button', text: 'Customer invoices', title: 'Read customer invoices', explanation: 'Review the original invoice, amount paid and outstanding balance. Opening this view does not collect money.' },
    { selector: 'a[href="/pharmacy/accounts"]', title: 'Collect against the original invoice', explanation: 'Customer accounts has the existing invoice collection workflow. Find the patient, use Invoices / collect and check the invoice before recording money received. We will not open or pay it automatically.' },
  ],
  'income-statement': [
    { selector: 'select:has(option[value="profit_loss"])', title: 'Choose Profit & loss', explanation: 'The income statement is labelled Profit & loss. Select it yourself if another statement is showing.' },
    { selector: 'form[aria-label="Report filters"]', title: 'Apply the reporting dates', explanation: 'Choose From and To, then Apply filters yourself. Typing dates alone does not apply them.' },
    { selector: 'section[aria-label="Sales summary"]', title: 'Read the result', explanation: 'After loading succeeds, review sales, medicine cost, running costs and reported profit. Current stock cards are not a historical snapshot. Viewing the report never posts a transaction.' },
  ],
};

export default function PharmacyTaskHelp({ slug, walkthrough = false }: { slug: string; walkthrough?: boolean }) {
  const article = learningArticles.find(a => a.slug === resolvePharmacyGuideSlug(slug));
  const steps = tours[slug];
  const [index, setIndex] = useState<number | null>(null), [found, setFound] = useState(false);
  const [dialog, setDialog] = useState<HTMLElement | null>(null);
  const start = useRef<HTMLButtonElement>(null), panel = useRef<HTMLElement>(null);
  const step = index === null ? undefined : steps?.[index];
  const close = () => {
    const modal = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]');
    const target = modal ? Array.from(modal.querySelectorAll<HTMLElement>('input, select, textarea, button, a[href]'))
      .find(element => !panel.current?.contains(element) && !element.hasAttribute('disabled') && element.getClientRects().length > 0) : start.current;
    setIndex(null);
    target?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!step) return;
    let target: HTMLElement | null = null;
    const locate = () => {
      setDialog(document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]'));
      const current = Array.from(document.querySelectorAll<HTMLElement>(step.selector)).find(element =>
        (!step.text || element.textContent?.trim() === step.text) && element.getClientRects().length > 0) || null;
      if (current === target) return;
      target?.classList.remove(help.highlight);
      target = current;
      setFound(!!target);
      if (target) { target.classList.add(help.highlight); target.scrollIntoView({ block: 'nearest', behavior: 'instant' }); }
    };
    setFound(false); locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } };
    document.addEventListener('keydown', dismiss, true);
    panel.current?.focus({ preventScroll: true });
    return () => { observer.disconnect(); target?.classList.remove(help.highlight); document.removeEventListener('keydown', dismiss, true); };
  }, [step]);
  if (!article) return null;
  const walkthroughPanel = step && steps && index !== null ? <section ref={panel} tabIndex={-1} className={help.walkthrough} aria-label={`${article.title} walkthrough`}>
      <p className={help.step}>Read-only guidance - step {index + 1} of {steps.length}</p>
      <h2>{step.title}</h2><p aria-live="polite">{step.explanation}</p>
      {!found && <p role="status">This control is not open yet. Follow the instruction above to open it yourself, or skip this step. No action has been performed.</p>}
      <div className={help.actions}>
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Back</button>
        {index < steps.length - 1 ? <button type="button" className="btn btn-sm btn-primary" onClick={() => setIndex(index + 1)}>{found ? 'Next step' : 'Skip step'}</button> : <button type="button" className="btn btn-sm btn-primary" onClick={close}>Finish guidance</button>}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setIndex(0)}>Restart</button>
        <button type="button" className="btn btn-sm btn-link" onClick={close}>Dismiss walkthrough</button>
      </div>
      <p className={help.step}>Nothing is entered, submitted, approved, paid or posted by this walkthrough. Escape dismisses it.</p>
    </section> : null;
  return <div className={`${help.help} d-print-none`}>
    <details><summary>How to use this page: {article.title}</summary>
      <p>{article.what}</p>
      <p><strong>Start here:</strong> {article.steps[0]}</p>
      <p><strong>Check the result:</strong> {article.manual.operations[0].verify}</p>
      <Link href={articleHref(slug)}>Read the complete guide: {article.title}</Link>
    </details>
    {walkthrough && steps && <button ref={start} type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setIndex(0)}>Show me how: {article.title}</button>}
    {dialog && walkthroughPanel ? createPortal(walkthroughPanel, dialog) : walkthroughPanel}
  </div>;
}
