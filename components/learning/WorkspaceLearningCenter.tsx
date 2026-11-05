'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useApplication } from '../Auth/useApplicationContext';
import { customFetch } from '../Auth/customFetch';
import { canAccessRolePage, roleWorkspace } from '../../lib/roleNavigationPolicy';
import {
    availableWorkspaceArticles, searchWorkspaceArticles, workspaceLearning,
    type LearningModule, type WorkspaceArticle,
} from '../../lib/workspaceLearning';
import LearningCenterHome from '../../app/pharmacy/guide/LearningCenterHome';
import LearningArticleContent from '../../app/pharmacy/guide/LearningArticleContent';
import WorkspaceWorkflowFigure from './WorkspaceWorkflowFigure';
import WorkspaceManual from './WorkspaceManual';
import guide from '../../app/pharmacy/guide/page.module.css';
import articleStyles from '../../app/pharmacy/guide/LearningCenterArticle.module.css';
import styles from './WorkspaceLearningCenter.module.css';

const contents = [
    ['open', 'Open this page'], ['purpose', 'What you can do'], ['interface', 'Controls and fields'],
    ['steps', 'Complete the tasks'], ['after', 'What happens afterwards'], ['verify', 'Check it worked'],
    ['recovery', 'Errors and safe recovery'], ['next', 'Next steps'],
] as const;

export default function WorkspaceLearningCenter({ moduleId, slug, view = 'manual' }: { moduleId: LearningModule; slug?: string; view?: 'manual' | 'guides' }) {
    const app = useApplication();
    return <LearningWorkspace key={`${moduleId}-${app?.tenantId}-${app?.branchid}-${app?.user?.employeeid}-${app?.user?.role}`} moduleId={moduleId} slug={slug} view={view}/>;
}

function LearningWorkspace({ moduleId, slug, view = 'manual' }: { moduleId: LearningModule; slug?: string; view?: 'manual' | 'guides' }) {
    const app = useApplication();
    const module = workspaceLearning.find(item => item.id === moduleId)!;
    const [stockAccess, setStockAccess] = useState<string[]>([]);
    const [accessState, setAccessState] = useState<'loading' | 'ready' | 'failed'>('loading');
    const [accessRevision, setAccessRevision] = useState(0);
    const needsStockAccess = moduleId === 'operations' && ['scientist', 'sonographer'].includes(roleWorkspace(app?.user?.role));

    useEffect(() => {
        if (!needsStockAccess || !app?.user?.employeeid) {
            setAccessState('ready');
            return;
        }
        let active = true;
        setAccessState('loading');
        setStockAccess([]);
        customFetch('inventory/department-stock/my-access').then(result => {
            if (!active) return;
            if (!result?.success || !Array.isArray(result.data)) throw Error('Access unavailable');
            setStockAccess(result.data.filter((grant: { can_request?: boolean; can_receive?: boolean; can_consume?: boolean }) =>
                grant.can_request || grant.can_receive || grant.can_consume).map((grant: { department: string }) => grant.department));
            setAccessState('ready');
        }).catch(() => { if (active) setAccessState('failed'); });
        return () => { active = false; };
    }, [needsStockAccess, app?.user?.employeeid, accessRevision]);

    const settings = { ...app?.settings, departmentStock: stockAccess };
    const available = availableWorkspaceArticles(module, app?.user?.role, settings);
    const [query, setQuery] = useState('');
    const [read, setRead] = useState<string[]>([]);
    const [storageError, setStorageError] = useState('');
    const storageKey = `pls-${app?.tenantId || 'local'}-${moduleId}-learning-read`;
    useEffect(() => {
        setRead([]);
        setStorageError('');
        try {
            const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) throw Error('Invalid progress');
            setRead(value.filter(item => module.articles.some(article => article.slug === item)));
        } catch { setStorageError('Reading progress could not be loaded on this device. The guides remain available.'); }
    }, [storageKey, module]);

    const article = available.find(item => item.slug === slug);
    const matches = searchWorkspaceArticles(available, query);
    const categories = Array.from(new Set(available.map(item => item.category)));
    const href = (value: string) => `/${moduleId}/guide/${value}`;
    const homeArticles = available.map(item => ({
        ...item,
        what: item.concept,
        mistakes: [item.recovery],
        manual: {
            kind: item.kind === 'workflow' ? 'workflow' as const : undefined,
            route: item.route,
            open: item.kind === 'workflow' ? 'Use Open the task page to reach a stage available to your active role. Read the linked task guides for each team’s part of the workflow.' : item.open,
            controls: item.controls.map(control => [control.name, control.description] as const),
            operations: [
                { id: 'complete', title: item.title, steps: [...item.before, ...item.steps], result: item.after, verify: item.verify },
                { id: 'example', title: 'Illustrative worked example', steps: [item.example.situation, item.example.action], result: item.example.expected, verify: item.verify },
            ],
            verify: [item.verify],
        },
    }));
    const articleView = homeArticles.find(item => item.slug === slug);
    const suggested = module.startPath.map(value => homeArticles.find(item => item.slug === value)).filter(item => item !== undefined);
    const position = article ? available.indexOf(article) : -1;
    const previous = position > 0 ? available[position - 1] : undefined;
    const next = position >= 0 ? available[position + 1] : undefined;
    const homeRoute = canAccessRolePage(app?.user?.role, `/${moduleId}`, settings) ? `/${moduleId}` : available[0]?.route;
    const markRead = () => {
        if (!article) return;
        const updated = read.includes(article.slug) ? read.filter(item => item !== article.slug) : [...read, article.slug];
        setRead(updated);
        try { localStorage.setItem(storageKey, JSON.stringify(updated)); setStorageError(''); }
        catch { setStorageError('The reading marker could not be saved on this device.'); }
    };

    if (!app?.user?.role) return <main className={guide.page}><p role="status">Loading your learning workspace…</p></main>;

    return (
        <main className={`${guide.page} ${styles.page}`}>
            <nav className={guide.breadcrumb} aria-label="Breadcrumb">
                <Link href={`/${moduleId}/guide`}>{module.title} Learning Center</Link>
                {slug && <><span aria-hidden="true"> / </span><span aria-current="page">{article?.title || 'Guide unavailable'}</span></>}
            </nav>
            {accessState === 'failed' && <div role="status" className={styles.notice}>
                Department stock guide access could not be checked.
                <button type="button" className="btn btn-outline-secondary" onClick={() => setAccessRevision(value => value + 1)}>Retry access check</button>
            </div>}
            {!slug && view === 'manual' && <WorkspaceManual module={module} articles={available} role={String(app.user.role)}/>}
            {!slug && view === 'guides' && <LearningCenterHome
                available={homeArticles}
                matches={homeArticles.filter(item => matches.some(match => match.slug === item.slug))}
                suggested={suggested.length ? suggested : homeArticles.slice(0, 3)}
                read={read}
                roleTitle={String(app.user.role).replace(/[_-]/g, ' ')}
                query={query}
                onQueryChange={setQuery}
                storageError={storageError}
                presentation={{
                    title: `${module.title} Learning Center`, supportLabel: `${module.title} support`, description: module.description,
                    searchPlaceholder: { operations: 'For example: validate a result', crm: 'For example: register a patient', billing: 'For example: collect a payment', inventory: 'For example: approve a requisition' }[moduleId],
                    homeHref: homeRoute || `/${moduleId}/guide`, homeLabel: homeRoute ? 'Open workspace' : 'All guides',
                    categories: categories.map(category => [category, category] as const),
                    glossary: module.glossary.map(item => [item.term, item.meaning] as const), articleHref: href,
                }}
            />}
            {slug && <>
                <div className={`${guide.topbar} ${articleStyles.topbar}`}>
                    <Link href={`/${moduleId}/guide`}>All guides</Link>
                    <span>{available.filter(item => read.includes(item.slug)).length} of {available.length} guides marked read on this device</span>
                </div>
                {storageError && <p role="status">{storageError}</p>}
                {article && <header className={articleStyles.header}>
                    <p>{article.category} · {article.kind === 'workflow' ? 'End-to-end workflow' : 'Practical page guide'}</p>
                    <h1>{article.title}</h1>
                    <p className={styles.purpose}>{article.purpose}</p>
                </header>}
                <div className={`${guide.layout} ${articleStyles.layout} ${styles.layout}`}>
                    <aside className={`${guide.sidebar} ${articleStyles.sidebar}`} aria-label="Guide library">
                        <h2>Guide library</h2>
                        <label className={guide.search}>Search guides
                            <input className="form-control" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a task, field or concept"/>
                        </label>
                        <p role="status">{matches.length} guides found</p>
                        <nav aria-label="Learning topics">{categories.map(category => {
                            const items = matches.filter(item => item.category === category);
                            return items.length > 0 && <details key={category} open={!!query.trim() || category === article?.category}>
                                <summary>{category}</summary>
                                <ul>{items.map(item => <li key={item.slug}><Link href={href(item.slug)} aria-current={item.slug === slug ? 'page' : undefined}>{item.title}</Link></li>)}</ul>
                            </details>;
                        })}</nav>
                        {!matches.length && <p>No matching guide. <button type="button" className={articleStyles.clearSearch} onClick={() => setQuery('')}>Clear search</button></p>}
                    </aside>
                    <div className={`${guide.content} ${articleStyles.content}`}>
                        {!article && <>
                            <h1>Guide unavailable</h1>
                            <p role="status">{needsStockAccess && accessState === 'loading' ? 'Checking your department stock access…' : 'Choose a guide available to your active role and enabled modules.'}</p>
                            <Link href={`/${moduleId}/guide`}>Browse available guides</Link>
                        </>}
                        {article && <>
                            {articleView && <LearningArticleContent article={articleView} available={homeArticles} hrefForArticle={href} illustration={article.kind === 'workflow' ? <WorkspaceWorkflowFigure slug={article.slug} hrefForArticle={href} availableSlugs={available.map(item => item.slug)}/> : undefined}/>}
                            <div className={`${guide.progress} ${articleStyles.progress}`}>
                                <button className="btn btn-outline-secondary" aria-pressed={read.includes(article.slug)} onClick={markRead}>{read.includes(article.slug) ? 'Mark as unread' : 'Mark as read'}</button>
                                <span>Optional reading marker saved on this device.</span>
                            </div>
                            <nav className={guide.pagination} aria-label="Previous and next guides">
                                {previous && <Link href={href(previous.slug)} rel="prev">Previous · {previous.title}</Link>}
                                {next && <Link href={href(next.slug)} rel="next">Next · {next.title}</Link>}
                            </nav>
                        </>}
                    </div>
                    <nav className={`${guide.contents} ${articleStyles.contents}`} aria-label="On this page">
                        <strong>On this page</strong>
                        {article ? <ol>{contents.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol> : <Link href={`/${moduleId}/guide`}>All guides</Link>}
                    </nav>
                </div>
            </>}
            <footer className={styles.footer}>Instructions describe the application workflows. Available actions depend on your active role, facility settings and record status.</footer>
        </main>
    );
}
