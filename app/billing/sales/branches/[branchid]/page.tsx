"use client";
import { useEffect, useState } from "react";
import BilledSummary from "../../../../../components/Billing/BillingSumamry/BilledSummary";
import BilledClientsView from '../../../../../components/Billing/BilledClientsView';
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Link from "next/link";

export default function DailySalesViewCustomerRepresentative({ params, searchParams }: {
	params: {
		branchid: string
	},
	searchParams: {
		from?: string,
		to?: string
	}
}) {
	const [transactions, setTransactions] = useState<any[]>([]);
	const [summary, setSummary] = useState<any>(undefined);
	const [branchIdState, setBranchIdState] = useState<string>("");
	const { branchid } = params;
	const { from, to } = searchParams;

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
			let endpoint = "billing/payment/info/client";
			if (from && to) {
				endpoint += `?from=${from}&to=${to}`;
			} else if (from) {
				endpoint += `?from=${from}`;
			} else if (to) {
				endpoint += `?to=${to}`;
			}
			endpoint = endpoint + `&&branchid=${branchIdState}`;
			try {
				const data = await customFetch(endpoint);
				if (data.status === "success" && data.statusCode === 200) {
					setTransactions(data.data);
					setSummary(data.summary);
				} else {
					setTransactions([]);
					setSummary(undefined);
				}
			} catch (error) {
				setTransactions([]);
				setSummary(undefined);
			}
		}
		fetchData();
	}, [branchIdState, from, to]);

	if (!branchIdState) {
		return <div className="alert alert-info">
			Please select a branch to view transactions.
			<Link href={'/billing/sales/branches'}>View Branches </Link>
		</div>;
	}

	return (
		<div>
			{branchIdState && <BilledSummary branchid={branchIdState} from={from} to={to} />}
			<BilledClientsView data={transactions } branchid={branchIdState}  />
		</div>
	);
}