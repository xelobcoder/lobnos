'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { RiBookOpenLine, RiPrinterLine } from '@remixicon/react';
import { manualIntroductions } from '../../lib/workspaceManual';
import type { WorkspaceArticle, WorkspaceLearningModule } from '../../lib/workspaceLearning';
import WorkspaceWorkflowFigure from './WorkspaceWorkflowFigure';
import WorkspacePilotGuide from './WorkspacePilotGuide';
import ManualPdfDownload from './ManualPdfDownload';
import SoftwareManualIntroduction from './SoftwareManualIntroduction';
import styles from './WorkspaceManual.module.css';

export default function WorkspaceManual({ module, articles, role }: {
    module: WorkspaceLearningModule; articles: WorkspaceArticle[]; role: string;
}) {
    const intro = manualIntroductions[module.id];
    const [search, setSearch] = useState('');
    const [contentsOpen, setContentsOpen] = useState(false);
    const [printError, setPrintError] = useState('');
    const documentRef = useRef<HTMLDivElement>(null);
    const topics = Array.from(new Set(articles.map(article => article.category)));
    const href = (slug: string) => `/${module.id}/guide/${slug}`;
    const matching = articles.filter(article => [article.title, article.category, article.concept, ...article.steps, ...article.controls.flatMap(control => [control.name, control.description])].join(' ').toLowerCase().includes(search.trim().toLowerCase()));

    function printManual() {
        const content = documentRef.current;
        if (!content) return;
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) { setPrintError('Allow the manual print window to open, then try again.'); return; }
        setPrintError('');
        printWindow.document.title = `${module.title} User Manual`;
        const css = printWindow.document.createElement('style');
        css.textContent = '@page{size:A4;margin:18mm}body{font:11pt/1.65 Arial,sans-serif;color:#15271b;margin:0}h1{font-size:26pt;color:#1b5e20}h2{font-size:18pt;break-after:avoid}h3{font-size:14pt;break-after:avoid}h4{font-size:11pt;break-after:avoid}section{margin:22px 0}article{break-before:page}a{color:#1b5e20}dl>div{margin:12px 0}dt{font-weight:700}dd{margin:4px 0}li{margin:7px 0}svg{max-width:100%;height:auto}figure{break-inside:avoid}button,[data-manual-tools]{display:none}code{overflow-wrap:anywhere}';
        printWindow.document.head.appendChild(css);
        const copy = printWindow.document.importNode(content, true);
        const originals = content.querySelectorAll('svg, svg *');
        const copies = copy.querySelectorAll('svg, svg *');
        originals.forEach((element, index) => {
            const computed = window.getComputedStyle(element);
            const target = copies[index] as SVGElement;
            for (const property of ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'font-family', 'font-size', 'font-weight']) {
                target.style.setProperty(property, computed.getPropertyValue(property));
            }
        });
        printWindow.document.body.appendChild(copy);
        printWindow.focus();
        printWindow.print();
    }

    return <div className={styles.manual}>
        <header className={styles.toolbar}>
            <div><RiBookOpenLine size={22} aria-hidden="true"/> <strong>{module.title} User Manual</strong></div>
            <div><Link href={`/${module.id}/guide?view=guides`}>Find a procedure</Link><ManualPdfDownload/><button type="button" className="btn btn-outline-primary" onClick={printManual}><RiPrinterLine size={18} aria-hidden="true"/> Print manual</button></div>
        </header>
        {printError && <p role="alert">{printError}</p>}
        <div className={styles.layout}>
            <aside className={styles.contents} aria-label="Manual contents">
                <h2>Contents</h2>
                <button type="button" className={`btn btn-outline-secondary ${styles.contentsToggle}`} aria-expanded={contentsOpen} aria-controls="manual-contents-links" onClick={() => setContentsOpen(value => !value)}>{contentsOpen ? 'Hide contents' : 'Show contents'}</button>
                <div id="manual-contents-links" className={contentsOpen ? undefined : styles.mobileCollapsed}>
                <label>Find a section<input className="form-control" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search tasks and fields"/></label>
                <nav>
                    <a href="#manual-software">Understanding PLS</a><a href="#manual-introduction">About this module</a>
                    <a href="#manual-roles">Roles and responsibilities</a>
                    <a href="#manual-start">Before you start</a>
                    <a href="#manual-controls">Rules and controls</a>
                    <a href="#manual-daily">Daily operating sequence</a>
                    {topics.map((topic, index) => <details key={topic} open={!!search.trim()}>
                        <summary>{index + 1}. {topic}</summary>
                        <ol>{matching.filter(article => article.category === topic).map(article => <li key={article.slug}><a href={`#procedure-${article.slug}`}>{article.title}</a></li>)}</ol>
                    </details>)}
                    <a href="#manual-glossary">Glossary</a>
                </nav>
                {search && <p role="status">{matching.length} matching procedures</p>}
                </div>
            </aside>
            <div ref={documentRef} className={styles.document} id="manual-document">
                <header className={styles.cover}>
                    <p className={styles.brand}>PRIME LABORATORY SOFTWARE (PLS)</p>
                    <p>User and training documentation</p>
                    <h1>{module.title}<br/>User Manual</h1>
                    <p>{module.description}</p>
                    <dl><div><dt>Audience</dt><dd>{intro.audience}</dd></div><div><dt>Active-role edition</dt><dd>{role} · {articles.length} procedures available</dd></div><div><dt>Source review</dt><dd>5 November 2026</dd></div></dl>
                </header>
                <SoftwareManualIntroduction/>
                <section id="manual-introduction">
                    <h2>About this manual</h2><p>{intro.overview}</p>
                    <h3>How to use the manual</h3>
                    <p>Read the operating sequence first, then work through the relevant numbered chapter. Each procedure explains the purpose, access path, controls, required preparation, actions, expected outcome and recovery. Worked examples illustrate how to apply the procedure. Use the task-page link when you are ready to perform the authorized task.</p>
                    <p>This edition includes procedures available to the active role and enabled facility modules. A colleague with a different role may see a different set of procedures. The application checks record scope, action permissions and financial controls again when work is performed.</p>
                    {intro.sections?.map(section => <section key={section.title}><h3>{section.title}</h3>{section.paragraphs.map((text,i)=><p key={i}>{text}</p>)}<h4>Staff check</h4><ul>{section.checklist.map((text,i)=><li key={i}>{text}</li>)}</ul></section>)}
                    <h3>Learning objectives</h3><ul>{intro.objectives.map(item => <li key={item}>{item}</li>)}</ul>
                </section>
                <section id="manual-roles"><h2>Roles and responsibilities</h2><dl>{intro.roles.map(([name, meaning]) => <div key={name}><dt>{name}</dt><dd>{meaning}</dd></div>)}</dl></section>
                <section id="manual-start"><h2>Before you start</h2><ol>{intro.readiness.map(item => <li key={item}>{item}</li>)}</ol><p>Confirm the patient or document reference before saving. Review the saved record after an uncertain response before repeating a transaction.</p></section>
                <section id="manual-controls"><h2>Rules and controls</h2><ul>{intro.rules.map(item => <li key={item}>{item}</li>)}</ul></section>
                <section id="manual-daily"><h2>Daily operating sequence</h2><ol>{intro.daily.map(item => <li key={item}>{item}</li>)}</ol></section>
                {topics.map((topic, chapterIndex) => <article key={topic} id={`chapter-${chapterIndex + 1}`}>
                    <h2 className={styles.chapter}>Chapter {chapterIndex + 1}<br/>{topic}</h2>
                    {articles.filter(article => article.category === topic).map((article, procedureIndex) => <section key={article.slug} id={`procedure-${article.slug}`} className={styles.procedure}>
                        <h3>{chapterIndex + 1}.{procedureIndex + 1} {article.title}</h3>
                        <p>{article.concept}</p>
                        <div data-manual-tools className={styles.procedureTools}><Link href={article.route}>Open task page</Link><Link href={href(article.slug)}>Open this procedure separately</Link></div>
                        <h4>Where to open it</h4><p>{article.open}</p>
                        {article.kind === 'workflow' && <WorkspaceWorkflowFigure slug={article.slug} hrefForArticle={href} availableSlugs={articles.map(item => item.slug)}/>}
                        {article.pilot && <WorkspacePilotGuide pilot={article.pilot}/>}
                        <h4>Before you begin</h4><ul>{article.before.map(item => <li key={item}>{item}</li>)}</ul>
                        <h4>Controls and fields</h4><dl>{article.controls.map((control, index) => <div key={`${article.slug}-control-${index}`}><dt>{control.name}</dt><dd>{control.description}</dd></div>)}</dl>
                        <h4>Step-by-step procedure</h4><ol>{article.steps.map(step => <li key={step}>{step}</li>)}</ol>
                        <h4>Expected outcome and verification</h4><p>{article.after}</p><p>{article.verify}</p>
                        <h4>Worked example</h4><div className={styles.example}><p><strong>Situation</strong> {article.example.situation}</p><p><strong>Action</strong> {article.example.action}</p><p><strong>Expected outcome</strong> {article.example.expected}</p></div>
                        <h4>Troubleshooting and recovery</h4><p>{article.recovery}</p>
                    </section>)}
                </article>)}
                {!articles.length && <p role="status">No procedures are available for this active role and module configuration.</p>}
                <section id="manual-glossary"><h2>Glossary</h2><dl>{module.glossary.map(item => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>)}</dl></section>
            </div>
            <aside className={styles.reading} aria-label="Manual reading guidance">
                <h2>Using this manual</h2><p>Follow the numbered chapters in the main document.</p><p>Use Contents to jump to a procedure. Search narrows the contents while keeping the manual intact.</p><p>Download PDF saves the full Operations, CRM, Billing and Inventory trainer manual. Print manual creates a printable copy of this active-role edition.</p><a href="#manual-document">Back to the beginning</a>
            </aside>
        </div>
    </div>;
}
