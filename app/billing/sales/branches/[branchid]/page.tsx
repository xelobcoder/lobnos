import BilledSummary from "../../../../../components/Billing/BillingSumamry/BilledSummary";
import BilledClientsView from '../../../../../components/Billing/BilledClientsView'
import { plsDecryption } from "../../../../../lib/encryption";
import { customFetch } from "../../../../../components/Auth/customFetch";


export default async function DailySalesViewCustomerRepresentative({ params, searchParams }: {
	params: {
		branchid: string
	},
	searchParams: {
		from: string,
		to: string
	}
}) {

	let { branchid } = await params;
	const { from, to } = await searchParams;
	let transactions = [];
	if (branchid) {
		branchid = plsDecryption(branchid.toString())
	}

	try {
		const data = await customFetch(
			`billing/payment/info/client?from=${from}&&to=${to}`
		);
		if (data.status === "success" && data.statusCode === 200) {
			transactions = data.result
		}
	} catch (error) {
		transactions = []
	}



	return (
		<div>
			{branchid && <BilledSummary branchid={branchid} />}
			<BilledClientsView data={transactions} branchid={branchid} />
		</div>
	);
}