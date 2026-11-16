"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiBuilding2Line, RiDatabase2Line, RiHistoryLine, RiMoneyDollarCircleLine, RiSettings4Line, RiShieldUserLine, RiToolsLine } from "@remixicon/react";

const base = "/master-platform";
const sections = [
    ["", "Client provisioning", RiBuilding2Line],
    ["/applications", "Website requests", RiBuilding2Line],
    ["/pricing", "Module pricing", RiMoneyDollarCircleLine],
    ["/plans", "Subscription plans", RiMoneyDollarCircleLine],
    ["/payments", "Payments & subscriptions", RiMoneyDollarCircleLine],
    ["/transactions", "Online payments", RiMoneyDollarCircleLine],
    ["/sms", "SMS configuration", RiSettings4Line],
    ["/devices", "Medical device interfacing", RiToolsLine],
    ["/backups", "Facility backups", RiDatabase2Line],
    ["/audit", "Audit logs", RiHistoryLine],
    ["/copy-test-setup", "Copy test setup", RiToolsLine],
    ["/account", "Master account", RiShieldUserLine],
] as const;

export default function FacilityNav() {
    const pathname = usePathname();

    return <nav className="list-group list-group-flush p-2 gap-1" aria-label="Platform administration">
        {sections.map(([path, label, Icon]) => {
            const href = base + path;
            const active = pathname === href;
            return <Link href={href} key={href} aria-current={active ? "page" : undefined}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 rounded border-0 px-2 py-2${active ? " list-group-item-success fw-semibold" : ""}`}>
                <Icon size={19} aria-hidden="true" />{label}
            </Link>;
        })}
    </nav>;
}
