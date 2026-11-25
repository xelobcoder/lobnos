"use client";

import Link from "next/link";
import { useState } from "react";
import workspace from "../../../components/Layout/WorkspaceLayout.module.css";
import { usePathname } from "next/navigation";
import { RiArrowDownSLine, RiArrowRightSLine, RiArchiveLine, RiBuilding2Line, RiBuildingLine, RiCapsuleLine, RiDatabase2Line, RiFlaskLine, RiHistoryLine, RiListCheck2, RiMoneyDollarCircleLine, RiPriceTag3Line, RiSettings4Line, RiShieldUserLine, RiTestTubeLine, RiToolsLine } from "@remixicon/react";

const base = "/master-platform";
type FacilityNavSection = {
    path: string;
    label: string;
    Icon: typeof RiToolsLine;
    children?: { path: string; label: string; Icon: typeof RiToolsLine }[];
};

const sections: FacilityNavSection[] = [
    { path: "", label: "Client provisioning", Icon: RiBuilding2Line },
    { path: "/applications", label: "Website requests", Icon: RiBuilding2Line },
    { path: "/pricing", label: "Module pricing", Icon: RiMoneyDollarCircleLine },
    { path: "/plans", label: "Subscription plans", Icon: RiMoneyDollarCircleLine },
    { path: "/payments", label: "Payments & subscriptions", Icon: RiMoneyDollarCircleLine },
    { path: "/transactions", label: "Online payments", Icon: RiMoneyDollarCircleLine },
    { path: "/sms", label: "SMS configuration", Icon: RiSettings4Line },
    { path: "/devices", label: "Medical device interfacing", Icon: RiToolsLine },
    { path: "/backups", label: "Facility backups", Icon: RiDatabase2Line },
    { path: "/audit", label: "Audit logs", Icon: RiHistoryLine },
    {
        path: "/test-catalog",
        label: "Test panel catalog",
        Icon: RiFlaskLine,
        children: [
            { path: "/test-catalog/testlist", label: "Test panels", Icon: RiListCheck2 },
            { path: "/test-catalog/references/departments", label: "Departments", Icon: RiBuildingLine },
            { path: "/test-catalog/references/sample-types", label: "Sample types", Icon: RiTestTubeLine },
            { path: "/test-catalog/references/containers", label: "Sample containers", Icon: RiArchiveLine },
            { path: "/test-catalog/references/drug-categories", label: "Drug categories", Icon: RiPriceTag3Line },
            { path: "/test-catalog/references/drugs", label: "Culture-sensitivity drugs", Icon: RiCapsuleLine },
        ],
    },
    { path: "/copy-test-setup", label: "Copy test setup", Icon: RiToolsLine },
    { path: "/account", label: "Master account", Icon: RiShieldUserLine },
] as const;

export default function FacilityNav({ onNavigate }: { onNavigate?: () => void } = {}) {
    const pathname = usePathname();
    const catalogOpen = pathname?.startsWith(`${base}/test-catalog`) ?? false;
    const [expanded, setExpanded] = useState(catalogOpen);

    return <nav className={workspace.navigation} aria-label="Platform administration">
        {sections.map(({ path, label, Icon, children }) => {
            if (children) {
                return <div key={path}>
                    <button type="button" className={`${workspace.item} ${workspace.groupButton} ${catalogOpen ? workspace.currentGroup : ""}`}
                        aria-expanded={expanded} onClick={() => setExpanded(open => !open)}>
                        <span className={workspace.icon}><Icon aria-hidden="true" /></span>
                        <span className={workspace.label}>{label}</span>
                        <span className={workspace.chevron}>{expanded ? <RiArrowDownSLine aria-hidden="true" /> : <RiArrowRightSLine aria-hidden="true" />}</span>
                    </button>
                    {expanded && <div className={workspace.submenu}>
                        {children.map(child => {
                            const href = base + child.path;
                            const active = pathname === href || pathname?.startsWith(`${href}/`);
                            return <Link href={href} key={href} aria-current={active ? "page" : undefined}
                                onClick={onNavigate} className={`${workspace.item} ${workspace.child}${active ? ` ${workspace.active}` : ""}`}>
                                <span className={workspace.icon}><child.Icon aria-hidden="true" /></span>{child.label}
                            </Link>;
                        })}
                    </div>}
                </div>;
            }

            const href = base + path;
            const active = pathname === href;
            return <Link href={href} key={href} aria-current={active ? "page" : undefined}
                onClick={onNavigate} className={`${workspace.item}${active ? ` ${workspace.active}` : ""}`}>
                <span className={workspace.icon}><Icon aria-hidden="true" /></span>{label}
            </Link>;
        })}
    </nav>;
}
