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
		<div className="container mx-2 text-sm">
			<div className="col-sm-12 col-md-6 col-lg-4 col-xl-3">
				{data.length > 0 && <div className="alert alert-info p-3 my-2">
					<strong>Note:</strong> Please check the sample before validating. Click on the assess button to view the sample.
				</div>}
			</div>
			<div className="my-2">
				<section>
					<PendingTableSample data={data} removeClient={removeClientFromList} />
				</section>
			</div>
		</div>
	);
}
