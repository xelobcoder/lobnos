"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiArrowLeftLine } from "@remixicon/react";
import styles from "./salesAnalyticsLayout.module.css";

export default function SalesAnalyticsLayout({ children }: Readonly<{ children: ReactNode }>) {
	const pathname = usePathname();

	return (
		<>
			{pathname !== "/analytics/sales" && (
				<nav className={styles.navigation} aria-label="Sales analytics navigation">
					<Link href="/analytics/sales" className={styles.backLink}>
						<RiArrowLeftLine size={17} aria-hidden="true" />
						<span>All sales reports</span>
					</Link>
				</nav>
			)}
			{children}
		</>
	);
}
