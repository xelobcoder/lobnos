"use client";

import React, { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { RiArrowDownSLine, RiArrowUpSLine, RiLayout2Line } from "@remixicon/react";
import type { Link as NavigationLink } from "./links/types";
import { buildRibbonGroups, buildRibbonTabs, findActiveNavigationPath } from "../../lib/ribbonNavigation";
import styles from "./RibbonLayout.module.css";

export default function RibbonNavigation({ links, pathname, onNavigate }: {
    links: NavigationLink[];
    pathname: string;
    onNavigate: () => void;
}) {
    const id = useId();
    const tabs = useMemo(() => buildRibbonTabs(links), [links]);
    const activePath = useMemo(() => findActiveNavigationPath(links, pathname), [links, pathname]);
    const currentTab = tabs.find(tab => tab.items.includes(activePath[0])) || tabs[0];
    const [selection, setSelection] = useState({ pathname, tabId: currentTab?.id });
    const [collapsed, setCollapsed] = useState(false);
    const tabButtons = useRef<Array<HTMLButtonElement | null>>([]);
    const selected = (selection.pathname === pathname && tabs.find(tab => tab.id === selection.tabId)) || currentTab;
    const groups = selected ? buildRibbonGroups(selected.items, selected.title) : [];
    const chooseTab = (index: number) => {
        setSelection({ pathname, tabId: tabs[index].id });
        tabButtons.current[index]?.focus();
    };

    if (!tabs.length) return null;

    return <section className={styles.ribbon} aria-label="Workspace ribbon">
        <div className={styles.tabRow}>
            <div className={styles.tabs} role="tablist" aria-label="Section commands">
                {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab"
                    id={`${id}-${tab.id}`} aria-controls={`${id}-commands`}
                    aria-selected={selected?.id === tab.id} tabIndex={selected?.id === tab.id ? 0 : -1}
                    ref={element => { tabButtons.current[index] = element; }}
                    className={styles.tab} title={tab.title}
                    onClick={() => setSelection({ pathname, tabId: tab.id })}
                    onKeyDown={event => {
                        let target: number;
                        if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
                        else if (event.key === "ArrowLeft") target = (index - 1 + tabs.length) % tabs.length;
                        else if (event.key === "Home") target = 0;
                        else if (event.key === "End") target = tabs.length - 1;
                        else return;
                        event.preventDefault();
                        chooseTab(target);
                    }}>
                    {tab.title}
                </button>)}
            </div>
            <button type="button" className={styles.toggle} aria-expanded={!collapsed}
                aria-controls={`${id}-commands`} aria-label={collapsed ? "Expand ribbon" : "Collapse ribbon"}
                title={collapsed ? "Expand ribbon" : "Collapse ribbon"} onClick={() => setCollapsed(value => !value)}>
                {collapsed ? <RiArrowDownSLine size={18} aria-hidden="true" /> : <RiArrowUpSLine size={18} aria-hidden="true" />}
            </button>
        </div>
        <div id={`${id}-commands`} role="tabpanel" aria-labelledby={`${id}-${selected?.id}`}
            className={styles.commands} hidden={collapsed}>
            {groups.map((group, index) => <div key={`${group.title}-${index}`} className={styles.commandGroup}
                role="group" aria-label={group.title}>
                <div className={styles.commandList}>
                    {group.commands.map((command, commandIndex) => <Link key={`${command.link}-${commandIndex}`}
                        href={command.link} prefetch={false} onClick={onNavigate}
                        className={styles.command} title={command.title}
                        aria-current={activePath.at(-1) === command ? "page" : undefined}>
                        <span className={styles.commandIcon} aria-hidden="true">{command.icon || <RiLayout2Line size={18} />}</span>
                        <span className={styles.commandLabel}>{command.title}</span>
                    </Link>)}
                </div>
                <span className={styles.groupTitle}>{group.title}</span>
            </div>)}
        </div>
    </section>;
}
