import type { ReactNode } from 'react';
import Link from 'next/link';
import guide from './page.module.css';

export interface LearningArticleView {
    slug: string;
    title: string;
    route: string;
    what: string;
    after: string;
    mistakes: string[];
    related: string[];
    manual: {
        route: string;
        open: string;
        taskRoute?: string;
        controls: ReadonlyArray<readonly [string, string]>;
        operations: { id: string; title: string; steps: string[]; result: string; verify: string }[];
        verify: string[];
    };
}
interface GuideVisual { file: string; alt: string; caption: string }

export default function LearningArticleContent({ article, available, hrefForArticle, visual, illustration }: {
    article: LearningArticleView;
    available: LearningArticleView[];
    hrefForArticle: (slug: string) => string;
    visual?: GuideVisual;
    illustration?: ReactNode;
}) {
    const page = article.manual;
    return <>
        <section id="open">
            <h2>How do I open this page?</h2>
            <p className={guide.example}>{page.open}</p>
            <p><code>{page.route}</code></p>
            <Link className="btn btn-outline-primary" href={article.route}>
                {page.taskRoute ? 'Open the register to select your record' : 'Open the task page'}
            </Link>
            <p className={guide.muted}>Use your own authorized account to perform this task.</p>
        </section>
        <section id="purpose"><h2>What can I do on this page?</h2><p>{article.what}</p>{illustration}</section>
        <section id="interface">
            <h2>What am I looking at?</h2>
            <dl className={guide.controls}>{page.controls.map(([name, description], index) => (
                <div key={`${article.slug}-control-${index}`}><dt>{name}</dt><dd>{description}</dd></div>
            ))}</dl>
            {visual && <figure className={guide.visual}>
                <a href={`/pharmacy-help/${visual.file}`} target="_blank" rel="noreferrer">
                    <img src={`/pharmacy-help/${visual.file}`} alt={visual.alt} width={1440} loading="lazy"/>
                </a>
                <figcaption>Demonstration captured from the application using synthetic test data. {visual.caption} Open the image to enlarge it. Your branch, role and records may differ.</figcaption>
            </figure>}
        </section>
        <section id="steps">
            <h2>How do I complete the task?</h2>
            <nav aria-label="Tasks in this guide"><ul>{page.operations.map(operation => (
                <li key={operation.id}><a href={`#task-${operation.id}`}>{operation.title}</a></li>
            ))}</ul></nav>
            {page.operations.map(operation => (
                <section key={operation.id} id={`task-${operation.id}`} className={guide.operation}>
                    <h3>{operation.title}</h3>
                    <ol>{operation.steps.map(step => <li key={step}>{step}</li>)}</ol>
                    <p><strong>Expected result</strong> {operation.result}</p>
                    <p className={guide.example}><strong>Check it worked</strong> {operation.verify}</p>
                </section>
            ))}
        </section>
        <section id="after"><h2>What happens after I complete the task?</h2><p>{article.after}</p></section>
        <section id="verify">
            <h2>How do I check that it worked?</h2>
            <ul>{page.verify.map(check => <li key={check}>{check}</li>)}</ul>
            <p className={guide.muted}>Instructions are checked against the application source. Live workflow acceptance testing remains separate. Use a training environment for practice transactions.</p>
        </section>
        <section id="recovery"><h2>What if something goes wrong?</h2><ul>{article.mistakes.map(mistake => <li key={mistake}>{mistake}</li>)}</ul></section>
        <section id="next">
            <h2>What should I do next?</h2>
            <ul>{article.related.filter(slug => available.some(item => item.slug === slug)).map(slug => {
                const related = available.find(item => item.slug === slug)!;
                return <li key={slug}><Link href={hrefForArticle(slug)}>{related.title}</Link></li>;
            })}</ul>
        </section>
    </>;
}
