"use client";

import { useEffect, useState } from 'react';

const TAGS = new Set('P DIV SPAN BR STRONG B EM I U S SUB SUP UL OL LI TABLE THEAD TBODY TFOOT TR TH TD BLOCKQUOTE H1 H2 H3 H4 H5 H6 HR'.split(' '));
const STYLES = new Set('color background-color font-family font-size font-weight font-style text-align text-decoration vertical-align line-height white-space margin margin-left margin-right margin-top margin-bottom padding border border-collapse width max-width'.split(' '));

export function containsReportMarkup(value: unknown): value is string {
    return typeof value === 'string' && (/<\/?[a-z][^>]*>/i.test(value) || /&lt;\/?[a-z][^&]*&gt;/i.test(value));
}

export function containsReportMarkdown(value: unknown): value is string {
    return typeof value === 'string' && /(?:^|\n)\s{0,3}#{1,6}\s|(?:^|\n)\s*[-*+]\s|\*\*[^*]+\*\*/m.test(value);
}

function escapeHtml(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatMarkdownLine(value: string): string {
    return escapeHtml(value)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*\s][^*]*?)\*/g, '<em>$1</em>')
        .replace(/_([^_\s][^_]*?)_/g, '<em>$1</em>');
}

export function markdownReportToHtml(markdown: string): string {
    const blocks: string[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];
    const flushParagraph = () => {
        if (paragraph.length) blocks.push(`<p>${paragraph.map(formatMarkdownLine).join('<br>')}</p>`);
        paragraph = [];
    };
    const flushList = () => {
        if (list.length) blocks.push(`<ul>${list.map(item => `<li>${formatMarkdownLine(item)}</li>`).join('')}</ul>`);
        list = [];
    };

    for (const line of markdown.replace(/\r\n?/g, '\n').split('\n')) {
        const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*)$/);
        const item = line.match(/^\s*[-*+]\s+(.*)$/);
        if (heading) {
            flushParagraph();
            flushList();
            const level = Math.min(5, Math.max(3, heading[1].length + 2));
            blocks.push(`<h${level}>${formatMarkdownLine(heading[2])}</h${level}>`);
        } else if (item) {
            flushParagraph();
            list.push(item[1]);
        } else if (!line.trim()) {
            flushParagraph();
            flushList();
        } else {
            flushList();
            paragraph.push(line);
        }
    }

    flushParagraph();
    flushList();
    return blocks.join('');
}

function decodeReportHtml(html: string): string {
    const text = document.createElement('textarea');
    text.innerHTML = html;
    return text.value;
}

export function sanitizeReportHtml(html: string): string {
    const document = new DOMParser().parseFromString(html, 'text/html');
    for (const element of Array.from(document.body.querySelectorAll('*')).reverse()) {
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE'].includes(element.tagName)) {
            element.remove();
            continue;
        }
        if (!TAGS.has(element.tagName)) {
            element.replaceWith(...Array.from(element.childNodes));
            continue;
        }
        for (const attribute of Array.from(element.attributes)) {
            if (['colspan', 'rowspan'].includes(attribute.name) && /^[1-9]\d?$/.test(attribute.value)) continue;
            if (attribute.name === 'style' && element instanceof HTMLElement) {
                for (const property of Array.from(element.style)) {
                    if (!STYLES.has(property) || /url|expression|@import|javascript|[\\]/i.test(element.style.getPropertyValue(property))) element.style.removeProperty(property);
                }
                continue;
            }
            element.removeAttribute(attribute.name);
        }
    }
    return document.body.innerHTML;
}

export default function ReportRichText({ html }: { html: string }) {
    const [safe, setSafe] = useState<{ source: string; html: string } | null>(null);
    useEffect(() => { setSafe({ source: html, html: sanitizeReportHtml(decodeReportHtml(html)) }); }, [html]);
    return safe?.source === html ? <div dangerouslySetInnerHTML={{ __html: safe.html }} /> : <div aria-busy="true" />;
}

export function ReportContent({ value }: { value: unknown }) {
    if (value === null || value === undefined || value === '') return null;
    const text = String(value);
    if (containsReportMarkup(value)) return <ReportRichText html={text} />;
    if (containsReportMarkdown(text)) return <ReportRichText html={markdownReportToHtml(text)} />;
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
}
