import BilledSummary from "../../../../../components/Billing/BillingSumamry/BilledSummary";
import BilledClientsView from '../../../../../components/Billing/BilledClientsView'
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";

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

	if (branchid) {
		branchid = plsDecryption(branchid.toString());
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

		const data = await customFetch(endpoint);


		if (data.status === "success" && data.statusCode === 200) {
			transactions = data.result;
		}
	} catch (error) {
		console.error("Error fetching transactions:", error);
		transactions = [];
	}


	return (
		<div>
			{branchid && <BilledSummary branchid={branchid} />}
			<BilledClientsView data={transactions} branchid={branchid} />
		</div>
	);
}