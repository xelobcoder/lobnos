"use client";

import { useEffect, useState } from 'react';

const TAGS = new Set('P DIV SPAN BR STRONG B EM I U S SUB SUP UL OL LI TABLE THEAD TBODY TFOOT TR TH TD BLOCKQUOTE H1 H2 H3 H4 H5 H6 HR'.split(' '));
const STYLES = new Set('color background-color font-family font-size font-weight font-style text-align text-decoration vertical-align line-height white-space margin margin-left margin-right margin-top margin-bottom padding border border-collapse width max-width'.split(' '));

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
    useEffect(() => { setSafe({ source: html, html: sanitizeReportHtml(html) }); }, [html]);
    return safe?.source === html ? <div dangerouslySetInnerHTML={{ __html: safe.html }} /> : <div>{html}</div>;
}
