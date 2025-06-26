import BilledSummary from "../../../../../components/Billing/BillingSumamry/BilledSummary";
import BilledClientsView from '../../../../../components/Billing/BilledClientsView'
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";
import Link from "next/link";

export default async function DailySalesViewCustomerRepresentative({ params, searchParams }: {
	params: {
		branchid: string
	},
	searchParams: {
		from?: string,
		to?: string
	}
}) {
	let { branchid } = await params;
	const { from, to } = await searchParams;
	let transactions = [];
	let summary = undefined;

	if (branchid) {
		try {
			branchid = plsDecryption(branchid.toString());
		} catch {
			return <div className="alert alert-danger text-small">Wrong Branch Provided</div>
		}
	}

	try {
		let endpoint = "billing/payment/info/client";
		if (from && to) {
			endpoint += `?from=${from}&to=${to}`;
		} else if (from) {
			endpoint += `?from=${from}`;
		} else if (to) {
			endpoint += `?to=${to}`;
		}

		endpoint = endpoint + `&&branchid=${branchid}`

		const data = await customFetch(endpoint);

		if (data.status === "success" && data.statusCode === 200) {
			transactions = data.data
			summary = data.summary
		}
	} catch (error) {
		transactions = [];
	}

	if (!branchid) {
		return <div className="alert alert-info">
			Please select a branch to view transactions.
			<Link href={'/billing/sales/branches'}>View Branches </Link>
		</div>
	}


	return (
		<div>
			{branchid && <BilledSummary branchid={branchid} from={from} to={to} />}
			<BilledClientsView data={transactions} branchid={branchid} />
		</div>
	);
}