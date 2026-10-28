"use client";
import { useEffect, type RefObject } from 'react';
import styles from './BilledClientsLayout.module.css';

/** Mirror the read-only header outside horizontal overflow, so page scrolling can pin it. */
export default function usePageStickyTableHeader(viewportRef: RefObject<HTMLDivElement | null>, revision: unknown, layer = 1020) {
    useEffect(() => {
        const viewport = viewportRef.current;
        const table = viewport?.querySelector('table');
        const sourceHead = table?.querySelector('thead');
        if (!viewport || !table || !sourceHead) return;
        const floating = document.createElement('div');
        floating.className = styles.floatingHeader;
        floating.style.zIndex = String(layer);
        floating.setAttribute('aria-hidden', 'true');
        floating.setAttribute('data-billed-floating-header', '');
        const copy = table.cloneNode(false) as HTMLTableElement;
        copy.appendChild(sourceHead.cloneNode(true));
        floating.appendChild(copy);
        document.body.appendChild(floating);
        let frame = 0;
        const update = () => {
            frame = 0;
            if (!viewport.isConnected) return;
            const bounds = viewport.getBoundingClientRect();
            let top = 0;
            let bottom = window.innerHeight;
            // Support both document scrolling and layouts with a scrolling main-content panel.
            for (let parent = viewport.parentElement; parent; parent = parent.parentElement) {
                const css = getComputedStyle(parent);
                if (/(auto|scroll|hidden)/.test(css.overflowY) && parent.scrollHeight > parent.clientHeight + 1) {
                    const clip = parent.getBoundingClientRect();
                    top = Math.max(top, clip.top);
                    bottom = Math.min(bottom, clip.bottom);
                }
            }
            document.querySelectorAll('header, [role="banner"], .navbar').forEach(element => {
                const css = getComputedStyle(element);
                const bar = element.getBoundingClientRect();
                if (['fixed', 'sticky'].includes(css.position) && bar.height > 0 && bar.height < 200 && bar.width > 300 && bar.bottom > top && bar.top <= top + 1 && bar.right > bounds.left && bar.left < bounds.right) top = bar.bottom;
            });
            const height = sourceHead.getBoundingClientRect().height;
            const left = Math.max(0, bounds.left);
            const width = Math.max(0, Math.min(window.innerWidth, bounds.right) - left);
            const visible = width > 0 && sourceHead.getBoundingClientRect().top < top && bounds.bottom > top && top < bottom;
            floating.style.display = visible ? 'block' : 'none';
            floating.style.left = `${left}px`;
            // Let the header leave with the last table row rather than overlay the next section.
            floating.style.top = `${Math.min(top, bounds.bottom - height)}px`;
            floating.style.width = `${width}px`;
            copy.style.width = `${table.getBoundingClientRect().width}px`;
            floating.scrollLeft = viewport.scrollLeft + left - bounds.left;
        };
        const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
        window.addEventListener('scroll', schedule, true);
        window.addEventListener('resize', schedule);
        const resize = new ResizeObserver(schedule);
        resize.observe(viewport);
        resize.observe(table);
        document.fonts?.ready.then(schedule);
        update();
        return () => {
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('resize', schedule);
            resize.disconnect();
            cancelAnimationFrame(frame);
            floating.remove();
        };
    }, [viewportRef, revision, layer]);
}
