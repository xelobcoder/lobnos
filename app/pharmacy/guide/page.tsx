'use client';
import Link from 'next/link';
import { useState } from 'react';
import { pharmacyGlossary, pharmacyGuideTopics } from '../../../lib/pharmacyGuide';
import { canAccessRolePage } from '../../../lib/roleNavigationPolicy';
import { styles, usePharmacyAccess } from '../components/PharmacyWorkspace';
import guide from './page.module.css';

export default function PharmacyGuidePage() {
  const { app } = usePharmacyAccess();
  const [query, setQuery] = useState('');
  const role = app?.user?.role;
  const search = query.trim().toLowerCase();
  const topics = pharmacyGuideTopics.map(topic => ({
    ...topic, pages: topic.pages.filter(page => canAccessRolePage(role, page.href)),
  })).filter(topic => topic.pages.length);
  const matches = topics.filter(topic => [topic.title, topic.introduction, ...topic.steps, ...topic.pages.flatMap(page => [page.title, page.purpose])].join(' ').toLowerCase().includes(search));
  return <main className={`${styles.page} ${guide.page}`}>
    <header className={styles.header}><div><h1>How to use pharmacy</h1><p>Choose what you want to do. Follow the steps, then open the page you need.</p></div><Link href="/pharmacy">Back to pharmacy</Link></header>
    {!role ? <p role="status">Loading your pharmacy access...</p> : !canAccessRolePage(role, '/pharmacy/guide') ? <p role="alert">Pharmacy access is required to use this guide.</p> : <>
      <p className={styles.muted}>Links below follow your role. Some steps need a manager, accountant or another reviewer; reading this guide does not grant their permissions.</p>
      <label className={guide.search}>Find a task or page<input type="search" className="form-control" value={query} onChange={event => setQuery(event.target.value)} placeholder="For example: purchase request, expenses, close the day"/></label>
      <nav className={guide.topics} aria-label="Pharmacy guide topics">{topics.map(topic => <a key={topic.id} href={`#${topic.id}`} onClick={() => setQuery('')}>{topic.title}</a>)}<a href="#glossary" onClick={() => setQuery('')}>Accounting words explained</a></nav>
      {matches.length === 0 && <p role="status">No matching task. Try a page name or clear the search.</p>}
      {matches.map(topic => <section key={topic.id} id={topic.id} className={guide.topic} aria-labelledby={`${topic.id}-title`}>
        <h2 id={`${topic.id}-title`}>{topic.title}</h2><p>{topic.introduction}</p>
        <ol className={guide.steps}>{topic.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <h3>Which page should I open?</h3>
        <ul className={guide.pages}>{topic.pages.map(page => <li key={page.href}><Link href={page.href}>{page.title}</Link><p>{page.purpose}</p></li>)}</ul>
        {topic.id === 'accounting' && <p className={styles.muted}>For an individual expense or journal, open its register and choose Review to see the evidence, approval history and permitted next actions.</p>}
        <a href="#top" onClick={event => { event.preventDefault(); event.currentTarget.closest('main')?.scrollIntoView(); }}>Back to top</a>
      </section>)}
      <section id="glossary" className={guide.topic} aria-labelledby="glossary-title"><h2 id="glossary-title">Accounting words explained</h2><dl className={guide.glossary}>{pharmacyGlossary.map(([term, meaning]) => <div key={term}><dt>{term}</dt><dd>{meaning}</dd></div>)}</dl></section>
    </>}
  </main>;
}
