"use client";
import { useEffect, useState } from "react";
import BilledSummary from "../../../../../components/Billing/BillingSumamry/BilledSummary";
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Link from "next/link";
import BilledClientsView from "../../../../../components/Billing/BilledClientsView";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { handleDatePicker } from "../../../../../components/serverActions/ActionFiltering";
import { RiSearchLine } from "@remixicon/react";
import { useApplicationSettings } from "../../../../../components/Auth/useApplicationContext";
import DateFilterReusable from "../../../../../components/operations/Laboratory/ResuableFilter/DateFilterReusable";

export default function DailySalesViewCustomerRepresentative({ params, searchParams }: {
	params: {
		branchid: string
	},
	searchParams: {
		from?: string,
		to?: string
	}
}) {
	const { user } = useApplication();
	const router = useRouter();
	const role = user?.role?.toLowerCase();
	const canViewAdvancedSales = ["admin", "accountant", "superadmin"].includes(role || "");
	const isDailyRestrictedView = !!role && !canViewAdvancedSales;
	const getTodayDateString = () => {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, "0");
		const day = String(today.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};
	const [transactions, setTransactions] = useState<any[]>([]);
	const [summary, setSummary] = useState<any>(undefined);
	const [expensesPaymentMade, setExpensesPaymentMade] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [branchIdState, setBranchIdState] = useState<string>("");
	const { branchid } = params;
	const initialFrom = searchParams.from || "";
	const initialTo = searchParams.to || "";
	const [datequery, setDatequery] = useState({ from: initialFrom, to: initialTo });
	// activeQuery for the actual search (only changes when search is clicked or initial load)
	const [activeQuery, setActiveQuery] = useState({ from: initialFrom, to: initialTo });
	const [dateFilter, setDateFilter] = useState("");

	// Sync URL search params with datequery on init/URL change
	useEffect(() => {
		if (isDailyRestrictedView) {
			const today = getTodayDateString();
			const forcedQuery = { from: today, to: today };
			setDatequery(forcedQuery);
			setActiveQuery(forcedQuery);
			return;
		}

		setDatequery({
			from: searchParams.from || '',
			to: searchParams.to || ''
		});
		setActiveQuery({
			from: searchParams.from || '',
			to: searchParams.to || ''
		});
	}, [searchParams.from, searchParams.to, isDailyRestrictedView]);

	// Only sync URL when activeQuery changes, not on every input change
	useEffect(() => {
		const currentPath = window.location.pathname;
		const newSearchParams = new URLSearchParams(window.location.search);
		newSearchParams.delete('from');
		newSearchParams.delete('to');
		if (activeQuery.from) newSearchParams.set('from', activeQuery.from);
		if (activeQuery.to) newSearchParams.set('to', activeQuery.to);
		const newUrl = `${currentPath}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
		window.history.replaceState(null, '', newUrl);
	}, [activeQuery.from, activeQuery.to]);

	useEffect(() => {
		let decryptedBranchId = "";
		if (branchid) {
			try {
				decryptedBranchId = plsDecryption(branchid.toString());
			} catch {
				setBranchIdState("");
				return;
			}
			setBranchIdState(decryptedBranchId);
		}
	}, [branchid]);

	useEffect(() => {
		async function fetchData() {
			if (!branchIdState) return;
			setIsLoading(true);
			const queryFrom = isDailyRestrictedView ? getTodayDateString() : activeQuery.from;
			const queryTo = isDailyRestrictedView ? getTodayDateString() : activeQuery.to;
			let endpoint = "billing/payment/info/client";
			if (queryFrom && queryTo) {
				endpoint += `?from=${queryFrom}&to=${queryTo}`;
			} else if (queryFrom) {
				endpoint += `?from=${queryFrom}`;
			} else if (queryTo) {
				endpoint += `?to=${queryTo}`;
			}
			endpoint = endpoint + `&&branchid=${branchIdState}&&isloadall=true`;
			try {
				const data = await customFetch(endpoint);
				if (data.status === "success" && data.statusCode === 200) {
					setTransactions(data.data);
					setSummary(data.summary);
					setExpensesPaymentMade(data.expensesPaymentMade || []);
				} else {
					setTransactions([]);
					setSummary(undefined);
					setExpensesPaymentMade([]);
				}
			} catch (error) {
				setTransactions([]);
				setSummary(undefined);
				setExpensesPaymentMade([]);
			} finally {
				setIsLoading(false);
			}
		}
		fetchData();
	}, [branchIdState, activeQuery.from, activeQuery.to, isDailyRestrictedView]);

	const handleSearchClick = () => {
		// Update activeQuery to trigger fetch
		setActiveQuery({ from: datequery.from, to: datequery.to });
		// Also call handleDatePicker if needed for navigation
		handleDatePicker({
			branchid: branchIdState,
			date: datequery.from,
			from: datequery.from,
			to: datequery.to
		}, router);
	};

	if (!branchIdState) {
		return <div className="alert alert-info">
			Please select a branch to view transactions.
			<Link href={'/billing/sales/branches'}>View Branches </Link>
		</div>;
	}

	return (
		<div>
			{isDailyRestrictedView ? (
				<div className="d-flex align-items-center justify-content-between mt-3 mb-3 flex-wrap gap-2">
					<span className="text-muted small">Showing sales for today only</span>
				</div>
			) : (
				<div className="d-flex align-items-center gap-2 mt-3 mb-3 flex-wrap">
					<div style={{ minWidth: '240px' }}>
						<DateFilterReusable
							value={dateFilter}
							onChange={setDateFilter}
							onDateRangeChange={(from, to) => setDatequery({ from, to })}
							label="Period"
							className="w-100"
						/>
					</div>
					<button
						className="btn btn-outline-secondary btn-sm d-flex align-items-center"
						onClick={handleSearchClick}
					>
						<RiSearchLine size={16} className="me-1" /> Search
					</button>
					{canViewAdvancedSales && datequery.from && datequery.to && (
						<button
							className="btn btn-primary btn-sm"
							onClick={() => window.open(`${branchid}/day-transaction-break-down?date=${datequery.from}&&from=${datequery.from}&&end=${datequery.to}&isOpenSideBarShow=false`)}
						>
							BreakDown
						</button>
					)}
				</div>
			)}

			{/* Summary component below filters */}
			{branchIdState && <BilledSummary branchid={branchIdState} from={activeQuery.from} to={activeQuery.to} summary={summary} />}

			{/* Table component at the bottom */}
			<BilledClientsView
				data={transactions ? transactions : []}
				branchid={branchIdState}
				expensesPaymentMade={expensesPaymentMade}
				isLoading={isLoading}
				datequery={datequery}
				setDatequery={setDatequery}
				showFilters={false}
			/>
		</div>
	);
}