"use client"
import PendingTableSample from "./pendingTable";

export default function SampleValidationComponent({ data, initialStartDate, initialEndDate }) {
	const removeClientFromList = (id) => {
		if (!id) return;
	};

	return (
		<div>
			<section>
				<PendingTableSample 
					data={data} 
					removeClient={removeClientFromList}
					initialStartDate={initialStartDate}
					initialEndDate={initialEndDate}
				/>
			</section>
		</div>
	);
}
