'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBookOpenLine,
  RiCheckboxCircleLine,
  RiCompass3Line,
  RiFileList3Line,
  RiQuestionLine,
  RiRouteLine,
  RiSearchLine,
  RiStackLine,
} from '@remixicon/react';
import { articleHref, learningCategories, pharmacyGlossary, type LearningArticle } from '../../../lib/pharmacyLearning';
import styles from './LearningCenterHome.module.css';

interface LearningCenterHomeProps {
  available: LearningArticle[];
  matches: LearningArticle[];
  suggested: LearningArticle[];
  read: string[];
  roleTitle: string;
  query: string;
  onQueryChange: (value: string) => void;
  storageError: string;
}

function GuideGroup({ id, title, items, read, expanded, workflow = false }: {
  id: string;
  title: string;
  items: LearningArticle[];
  read: string[];
  expanded: boolean;
  workflow?: boolean;
}) {
  return <details id={id} className={styles.guideGroup} open={expanded}>
    <summary>
      <span className={styles.groupIcon} aria-hidden="true">{workflow ? <RiRouteLine size={20}/> : <RiFileList3Line size={20}/>}</span>
      <span className={styles.groupHeading}><strong>{title}</strong><small>{items.length} {items.length === 1 ? 'guide' : 'guides'}{workflow ? ' · Some steps need another authorized person.' : ''}</small></span>
      <RiArrowDownSLine className={styles.chevron} size={20} aria-hidden="true"/>
    </summary>
    <ul className={styles.guideList}>
      {items.map(item => <li key={item.slug}>
        <Link href={articleHref(item.slug)}>
          <span>{item.title}</span>
          {read.includes(item.slug) && <span className={styles.readBadge}><RiCheckboxCircleLine size={15} aria-hidden="true"/> Read</span>}
          <RiArrowRightLine className={styles.guideArrow} size={17} aria-hidden="true"/>
        </Link>
      </li>)}
    </ul>
  </details>;
}

export default function LearningCenterHome({ available, matches, suggested, read, roleTitle, query, onQueryChange, storageError }: LearningCenterHomeProps) {
  const [topic, setTopic] = useState('all');
  const [format, setFormat] = useState('all');
  const searchInput = useRef<HTMLInputElement>(null);
  const topics = learningCategories.filter(([id]) => available.some(article => article.category === id));
  const activeTopic = topic === 'all' || topics.some(([id]) => id === topic) ? topic : 'all';

  useEffect(() => {
    if (topic !== activeTopic) setTopic(activeTopic);
  }, [activeTopic, topic]);

  useEffect(() => {
    const revealLinkedTopic = () => {
      const target = document.getElementById(window.location.hash.slice(1));
      if (target instanceof HTMLDetailsElement) {
        target.open = true;
        target.scrollIntoView();
      }
    };
    revealLinkedTopic();
    window.addEventListener('hashchange', revealLinkedTopic);
    return () => window.removeEventListener('hashchange', revealLinkedTopic);
  }, []);

  const filtered = matches.filter(article =>
    (activeTopic === 'all' || article.category === activeTopic) &&
    (format === 'all' || (format === 'workflow' ? article.manual.kind === 'workflow' : article.manual.kind !== 'workflow'))
  );
  const hasFilters = !!query.trim() || activeTopic !== 'all' || format !== 'all';
  const filterKey = `${query}:${activeTopic}:${format}`;
  const workflows = filtered.filter(article => article.manual.kind === 'workflow');
  const markedRead = available.filter(article => read.includes(article.slug)).length;

  const clearFilters = () => {
    onQueryChange('');
    setTopic('all');
    setFormat('all');
    searchInput.current?.focus();
  };

  return <div className={styles.workspace}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <span className={styles.headerIcon} aria-hidden="true"><RiBookOpenLine size={24}/></span>
        <div>
          <span className={styles.eyebrow}>Pharmacy support</span>
          <h1>Pharmacy Learning Center</h1>
          <p>Find practical guidance for your daily pharmacy tasks.</p>
        </div>
      </div>
      <div className={styles.actions}>
        <Link className={styles.secondary} href="/pharmacy"><RiArrowLeftLine size={18} aria-hidden="true"/> Pharmacy home</Link>
        <a className={styles.primary} href="#guide-catalogue">Browse guides <RiArrowRightLine size={18} aria-hidden="true"/></a>
      </div>
    </header>

    <section className={styles.stats} aria-label="Learning center overview">
      <div className={styles.stat}>
        <span className={styles.statIcon} aria-hidden="true"><RiBookOpenLine size={21}/></span>
        <div><strong>{available.length}</strong><span>Guides available</span></div>
      </div>
      <div className={styles.stat}>
        <span className={styles.statIcon} aria-hidden="true"><RiCheckboxCircleLine size={21}/></span>
        <div><strong>{markedRead}</strong><span>Marked read on this device</span></div>
      </div>
      <div className={styles.stat}>
        <span className={styles.statIcon} aria-hidden="true"><RiStackLine size={21}/></span>
        <div><strong>{topics.length}</strong><span>Learning topics</span></div>
      </div>
    </section>

    {storageError && <p className={styles.notice} role="status">{storageError}</p>}

    <section id="guide-catalogue" className={styles.catalogue} aria-labelledby="guide-catalogue-title">
      <div className={styles.sectionHeader}>
        <div>
          <h2 id="guide-catalogue-title">Explore the guides</h2>
          <p>Search by task, page or field, or narrow the library by topic and guide type.</p>
        </div>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.field}>
          <label htmlFor="learning-search"><RiSearchLine size={16} aria-hidden="true"/> Search guides</label>
          <input ref={searchInput} id="learning-search" type="search" value={query} onChange={event => onQueryChange(event.target.value)} placeholder="For example: pay a supplier"/>
        </div>
        <div className={styles.field}>
          <label htmlFor="learning-topic">Topic</label>
          <select id="learning-topic" value={activeTopic} onChange={event => setTopic(event.target.value)}>
            <option value="all">All topics</option>
            {topics.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label htmlFor="learning-format">Guide type</label>
          <select id="learning-format" value={format} onChange={event => setFormat(event.target.value)}>
            <option value="all">All guides</option>
            <option value="page">Page guides</option>
            <option value="workflow">Workflows</option>
          </select>
        </div>
      </div>
      <div className={styles.resultBar}>
        <p role="status">Showing {filtered.length} of {available.length} {available.length === 1 ? 'guide' : 'guides'}</p>
        <button type="button" className={styles.textButton} onClick={clearFilters}>Clear filters</button>
      </div>

      <div className={styles.catalogueBody}>
        {!hasFilters && suggested.length > 0 && <section className={styles.learningPath} aria-labelledby="learning-path-title">
          <div className={styles.pathHeader}>
            <div className={styles.pathTitle}>
              <span className={styles.groupIcon} aria-hidden="true"><RiCompass3Line size={21}/></span>
              <div><span className={styles.eyebrow}>A good place to start</span><h3 id="learning-path-title">Your learning path</h3></div>
            </div>
            <span className={styles.roleBadge}>{roleTitle}</span>
          </div>
          <p>Recommended for your responsibilities. Guides and task links follow your existing page access.</p>
          <ol className={styles.recommendations}>
            {suggested.map((article, index) => <li key={article.slug}>
              <Link href={articleHref(article.slug)}>
                <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.recommendationText}><strong>{article.title}</strong><small>{article.manual.kind === 'workflow' ? 'Workflow' : 'Page guide'}{read.includes(article.slug) ? ' · Read' : ''}</small></span>
                <RiArrowRightLine size={18} aria-hidden="true"/>
              </Link>
            </li>)}
          </ol>
        </section>}

        {filtered.length ? <>
          <div className={styles.directoryHeader}>
            <div><h3>Browse by topic</h3><p>Expand a topic to choose a guide.</p></div>
          </div>
          {workflows.length > 0 && <GuideGroup key={`workflows:${filterKey}`} id="workflows" title="End-to-end workflows" items={workflows} read={read} expanded={hasFilters} workflow/>}
          <div className={styles.directory}>
            {learningCategories.map(([id, title]) => {
              const items = filtered.filter(article => article.category === id && article.manual.kind !== 'workflow');
              return items.length ? <GuideGroup key={`${id}:${filterKey}`} id={id} title={title} items={items} read={read} expanded={hasFilters}/> : null;
            })}
          </div>
        </> : <div className={styles.empty}>
          <RiSearchLine size={30} aria-hidden="true"/>
          <h3>No matching guide</h3>
          <p>Try a different search or clear the filters to see all available guides.</p>
          <button type="button" className={styles.secondary} onClick={clearFilters}>Clear filters</button>
        </div>}
      </div>
    </section>

    <details id="glossary" className={styles.glossary}>
      <summary>
        <span className={styles.groupIcon} aria-hidden="true"><RiQuestionLine size={21}/></span>
        <span className={styles.groupHeading}><strong>Words used in these pages</strong><small>Common terms explained in plain language</small></span>
        <RiArrowDownSLine className={styles.chevron} size={20} aria-hidden="true"/>
      </summary>
      <dl>{pharmacyGlossary.map(([word, meaning]) => <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>)}</dl>
    </details>
  </div>;
}
