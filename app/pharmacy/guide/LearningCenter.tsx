'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { articleHref, learningArticles, learningCategories, pharmacyGuideVisuals, resolvePharmacyGuideSlug, type LearningArticle } from '../../../lib/pharmacyLearning';
import { canAccessRolePage } from '../../../lib/roleNavigationPolicy';
import { normalizeRole } from '../../../components/Auth/roles';
import { usePharmacyAccess } from '../components/PharmacyWorkspace';
import LearningCenterHome from './LearningCenterHome';
import LearningArticleContent from './LearningArticleContent';
import guide from './page.module.css';
import articleStyles from './LearningCenterArticle.module.css';

const storageKey = 'pls-pharmacy-learning-read';
const contents = [
  ['open', 'Open this page'], ['purpose', 'What you can do'], ['interface', 'Controls and fields'],
  ['steps', 'Complete the tasks'], ['after', 'What happens afterwards'], ['verify', 'Check it worked'],
  ['recovery', 'Errors and safe recovery'], ['next', 'Next steps'],
] as const;
const pathForRole = (role: unknown): { title: string; slugs: string[] } => {
  const key = normalizeRole(role);
  if (['admin', 'superadmin'].includes(key)) return { title: 'Administrator', slugs: ['pharmacy-settings', 'cashier-shift', 'approve-request', 'shared-records'] };
  if (key === 'pharmacymanager') return { title: 'Pharmacy manager', slugs: ['approve-request', 'supplier-payment', 'close-day', 'profit'] };
  if (key === 'pharmacyaccountant') return { title: 'Pharmacy accountant', slugs: ['pharmacy-finances', 'customer-balances', 'supplier-payment', 'record-expense', 'bank-reconciliation'] };
  if (key === 'pharmacystorekeeper') return { title: 'Storekeeper', slugs: ['stock-quantities', 'create-purchase-request', 'receive-delivery', 'stock-controls'] };
  return { title: 'Sales & dispensing', slugs: ['point-of-sale', 'sell-medicines', 'counter-invoice', 'customer-payments', 'sales-history'] };
};

function Article({ article, available }: { article: LearningArticle; available: LearningArticle[] }) {
  return <LearningArticleContent article={article} available={available} hrefForArticle={articleHref} visual={pharmacyGuideVisuals[article.slug]}/>;
}

export default function LearningCenter({ slug }: { slug?: string }) {
  const { app } = usePharmacyAccess(), role = app?.user?.role;
  const [query, setQuery] = useState(''), [read, setRead] = useState<string[]>([]), [storageError, setStorageError] = useState('');
  useEffect(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) throw Error('Invalid learning progress');
      setRead(value.filter(v => learningArticles.some(a => a.slug === v)));
    } catch { setStorageError('Reading progress could not be loaded on this device. The guides are still available.'); }
  }, []);
  const permitted = !!role && canAccessRolePage(role, '/pharmacy/guide');
  const available = permitted ? learningArticles.filter(a => canAccessRolePage(role, a.route)) : [];
  const search = query.trim().toLowerCase();
  const matches = available.filter(a => [a.title, a.manual.open, a.manual.route, a.what, ...a.manual.controls.flat(), ...a.steps, ...a.manual.operations.map(o => `${o.title} ${o.verify}`)].join(' ').toLowerCase().includes(search));
  const article = available.find(a => a.slug === resolvePharmacyGuideSlug(slug || ''));
  const path = pathForRole(role), suggested = path.slugs.map(s => available.find(a => a.slug === resolvePharmacyGuideSlug(s))).filter((a): a is LearningArticle => !!a);
  const category = learningCategories.find(([id]) => id === article?.category)?.[1];
  const position = article ? available.indexOf(article) : -1;
  const previous = available[position - 1], next = position >= 0 ? available[position + 1] : undefined;
  const markRead = () => {
    if (!article) return;
    const updated = read.includes(article.slug) ? read.filter(s => s !== article.slug) : [...read, article.slug];
    setRead(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); setStorageError(''); }
    catch { setStorageError('This reading marker could not be saved. It will last only while this page is open.'); }
  };
  return <main className={guide.page}>
    <nav className={guide.breadcrumb} aria-label="Breadcrumb"><Link href="/pharmacy">Pharmacy</Link><span aria-hidden="true"> / </span>{slug ? <><Link href="/pharmacy/guide">Learning Center</Link><span aria-hidden="true"> / </span><span aria-current="page">{article?.title || 'Article unavailable'}</span></> : <span aria-current="page">Learning Center</span>}</nav>
    {!permitted ? <p role={role ? 'alert' : 'status'}>{role ? 'Pharmacy access is required to use the Learning Center.' : 'Loading your pharmacy access...'}</p> : !slug ?
      <LearningCenterHome available={available} matches={matches} suggested={suggested} read={read} roleTitle={path.title} query={query} onQueryChange={setQuery} storageError={storageError}/> : <>
      <div className={`${guide.topbar} ${articleStyles.topbar}`}><Link href="/pharmacy/guide">All guides</Link><span className={guide.muted}>{available.filter(a => read.includes(a.slug)).length} of {available.length} guides marked read on this device</span></div>
      {storageError && <p role="status">{storageError}</p>}
      {article && <header className={articleStyles.header}><p>{category} <span aria-hidden="true"> / </span> {article.manual.kind === 'workflow' ? 'End-to-end workflow' : 'Practical page guide'}</p><h1>{article.title}</h1></header>}
      <div className={`${guide.layout} ${articleStyles.layout}`}>
        <aside className={`${guide.sidebar} ${articleStyles.sidebar}`} aria-label="Learning categories">
          <h2>Guide library</h2>
          <label className={guide.search}>Search guides<input className="form-control" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="For example: pay a supplier"/></label>
          <p role="status" className={guide.muted}>{matches.length} {matches.length === 1 ? 'guide' : 'guides'}{search ? ' found' : ' available'}</p>
          <nav aria-label="Learning topics">{learningCategories.map(([id, title]) => {
            const items = matches.filter(a => a.category === id);
            return items.length ? <details key={id} open={!!search || article?.category === id}><summary>{title}</summary><ul>{items.map(a => <li key={a.slug}><Link aria-current={a.slug === article?.slug ? 'page' : undefined} href={articleHref(a.slug)}>{a.title}</Link></li>)}</ul></details> : null;
          })}</nav>
          {!matches.length && <p>No matching guide. Try a different word or <button type="button" className={articleStyles.clearSearch} onClick={() => setQuery('')}>clear the search</button>.</p>}
        </aside>
        <div className={`${guide.content} ${articleStyles.content}`}>
          {article ? <>
            <Article article={article} available={available}/>
            <div className={`${guide.progress} ${articleStyles.progress}`}><button type="button" className="btn btn-outline-secondary" aria-pressed={read.includes(article.slug)} onClick={markRead}>{read.includes(article.slug) ? 'Mark as unread' : 'Mark as read'}</button><span>Optional reading marker, not training certification. Stored only on this device.</span></div>
            <nav className={guide.pagination} aria-label="Previous and next guides">{previous && <Link rel="prev" href={articleHref(previous.slug)}>Previous: {previous.title}</Link>}{next && <Link rel="next" href={articleHref(next.slug)}>Next: {next.title}</Link>}</nav>
          </> : <><h1>Article unavailable</h1><p>This guide does not exist or is outside your current responsibilities.</p><Link href="/pharmacy/guide">Choose an available guide</Link></>}
        </div>
        {article && <nav className={`${guide.contents} ${articleStyles.contents}`} aria-label="On this page"><strong>On this page</strong><ol>{contents.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol></nav>}
      </div>
    </>}
  </main>;
}
