"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
     RiAddLine,
     RiArrowDownSLine,
     RiBuilding2Line,
     RiFileList3Line,
     RiFlaskLine,
     RiHome5Line,
     RiMore2Fill,
     RiNotification3Line,
     RiQuestionLine,
     RiSearchLine,
     RiSettings4Line,
     RiTeamLine,
     RiUser3Line,
} from "@remixicon/react";
import styles from "./PartnerShell.module.css";

const navigation = [
     { label: "Home", href: "/partner", icon: RiHome5Line },
     { label: "Orders", href: "/partner/orders", icon: RiFileList3Line },
     { label: "Patients", href: "/partner/patients", icon: RiTeamLine },
     { label: "Results", href: "/partner/results", icon: RiFlaskLine },
];

export default function PartnerShell({ children }: { children: React.ReactNode }) {
     const pathname = usePathname();
     const isActive = (href: string) => href === "/partner" ? pathname === href : pathname.startsWith(href);

     return (
          <div className={styles.shell}>
               <header className={styles.topbar}>
                    <Link href="/partner" className={styles.brand} aria-label="PrimeLab Partner Workspace home">
                         <span className={styles.brandMark}><RiFlaskLine size={21} /></span>
                         <span>
                              <strong>PrimeLab</strong>
                              <small>Partner Workspace</small>
                         </span>
                    </Link>

                    <div className={styles.partnerIdentity}>
                         <span className={styles.partnerIcon}><RiBuilding2Line size={17} /></span>
                         <span className={styles.partnerCopy}>
                              <small>Operating as</small>
                              <strong>North Ridge Medical Centre</strong>
                         </span>
                         <RiArrowDownSLine size={17} aria-hidden="true" />
                    </div>

                    <div className={styles.topActions}>
                         <label className={styles.search}>
                              <RiSearchLine size={18} aria-hidden="true" />
                              <span className="visually-hidden">Search workspace</span>
                              <input type="search" placeholder="Search orders or patients" />
                              <kbd>Ctrl K</kbd>
                         </label>
                         <button type="button" className={styles.iconButton} aria-label="Help" title="Help">
                              <RiQuestionLine size={19} />
                         </button>
                         <button type="button" className={styles.iconButton} aria-label="Notifications, 3 unread" title="Notifications">
                              <RiNotification3Line size={19} />
                              <span className={styles.notificationDot}>3</span>
                         </button>
                         <button type="button" className={styles.profileButton} aria-label="Open user menu">
                              <span className={styles.avatar}>EA</span>
                              <span className={styles.profileCopy}><strong>Elaine Amponsah</strong><small>Billing officer</small></span>
                              <RiArrowDownSLine size={17} aria-hidden="true" />
                         </button>
                    </div>
               </header>

               <aside className={styles.sidebar}>
                    <nav aria-label="Partner workspace">
                         <span className={styles.navLabel}>Workspace</span>
                         {navigation.map(({ label, href, icon: Icon }) => (
                              <Link key={href} href={href} className={`${styles.navItem} ${isActive(href) ? styles.active : ""}`}>
                                   <Icon size={20} />
                                   <span>{label}</span>
                              </Link>
                         ))}
                         <span className={styles.navLabel}>Manage</span>
                         <Link href="/partner/team" className={`${styles.navItem} ${isActive("/partner/team") ? styles.active : ""}`}>
                              <RiUser3Line size={20} /><span>Team</span>
                         </Link>
                         <Link href="/partner/settings" className={`${styles.navItem} ${isActive("/partner/settings") ? styles.active : ""}`}>
                              <RiSettings4Line size={20} /><span>Settings</span>
                         </Link>
                    </nav>

                    <div className={styles.supportPanel}>
                         <RiQuestionLine size={21} />
                         <strong>Need assistance?</strong>
                         <span>Partner support is available weekdays.</span>
                         <button type="button">Contact support</button>
                    </div>
               </aside>

               <main className={styles.main}>{children}</main>

               <nav className={styles.mobileNav} aria-label="Mobile partner workspace">
                    {navigation.map(({ label, href, icon: Icon }) => (
                         <Link key={href} href={href} className={isActive(href) ? styles.mobileActive : ""}>
                              <Icon size={21} /><span>{label}</span>
                         </Link>
                    ))}
                    <Link href="/partner/settings" className={isActive("/partner/settings") ? styles.mobileActive : ""}>
                         <RiMore2Fill size={21} /><span>More</span>
                    </Link>
               </nav>

               <Link href="/partner/orders/new" className={styles.mobileCreate} aria-label="Create new order">
                    <RiAddLine size={25} />
               </Link>
          </div>
     );
}