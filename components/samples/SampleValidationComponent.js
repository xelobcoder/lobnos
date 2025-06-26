"use client"
import PendingTableSample from "./pendingTable";

export default function SampleValidationComponent({ data }) {


	const removeClientFromList = (id) => {
		if (!id) return;
		setLoading(true);
		setData((prev) => prev.filter((item) => item.billingid !== id));
		setLoading(false);
	};



	return (
		<div >
			<section>
				<PendingTableSample data={data} removeClient={removeClientFromList} />
			</section>
		</div>
	);
}
