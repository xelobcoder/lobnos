"use client";

import { useRef, useState, type ReactNode } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import FacilityNav from "../settings/facilities/FacilityNav";
import workspace from "../../components/Layout/WorkspaceLayout.module.css";
import styles from "./platform.module.css";
import MasterSignOut from "./MasterSignOut";

export default function MasterWorkspace({ children }: { children: ReactNode }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuToggle = useRef<HTMLButtonElement>(null);

    return <div className={`${workspace.shell} ${workspace.slackLayout} ${styles.layout}`}
        onKeyDown={event => {
            if (event.key === "Escape" && menuOpen) {
                setMenuOpen(false);
                menuToggle.current?.focus();
            }
        }}>
        <a className={styles.skipLink} href="#master-workspace-content">Skip to content</a>
        <header className={`${workspace.header} ${styles.header}`}>
            <div className={styles.headerLeft}>
                <button ref={menuToggle} type="button" className={styles.menuToggle} aria-label={menuOpen ? "Close platform menu" : "Open platform menu"}
                    aria-controls="master-workspace-sidebar" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>
                    {menuOpen ? <RiCloseLine size={20} aria-hidden="true" /> : <RiMenuLine size={20} aria-hidden="true" />}
                </button>
                <div className={`${workspace.headerBrand} ${styles.brand}`}>
                    <span className={workspace.headerBrandMark} aria-hidden="true">PLS</span>
                    <span className={workspace.headerBrandName}>Prime Laboratory Software</span>
                </div>
                <strong className={styles.heading}>Platform Administration</strong>
            </div>
            <MasterSignOut />
        </header>
        <aside id="master-workspace-sidebar" className={`${workspace.sidebar} ${styles.sidebar}`} data-open={menuOpen}>
            <div className={workspace.slackSidebarHeader}>
                <span className={workspace.slackBrandMark} aria-hidden="true">PLS</span>
                <span className={workspace.slackWorkspaceName}>Platform Administration</span>
            </div>
            <FacilityNav onNavigate={() => setMenuOpen(false)} />
        </aside>
        <div id="master-workspace-content" className={styles.content} tabIndex={-1}>{children}</div>
    </div>;
}
