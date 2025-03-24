import { customFetch } from "../../Lib/fetcher";
import SUPPLIERS_LIST from "../../components/Supplier/SupplierList";



export default async function PurchaseManagementPage() {
	let rawdata: any[] = [];
	try {
		const response = await customFetch(`suppliers?count=10&&page=1`);
		rawdata = response.result;
	} catch (err) {
		rawdata = [];
	}
	
	return (
		<div>
			<SUPPLIERS_LIST rawdata={rawdata} />
		</div>
	);
}
