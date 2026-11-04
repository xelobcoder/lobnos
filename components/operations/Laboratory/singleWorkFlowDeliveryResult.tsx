"use client";

import BulkWorkFlowResultDeliveryModal from "./bulkWorkFlowDeliveryResult";
import type { DeliveryItem } from "./resultDeliveryHistory";

type Props = {
	show: boolean;
	onHide: () => void;
	employeeid: number;
	item: DeliveryItem | null;
	onSuccess: (shouldClose?: boolean) => void;
	workflow: string;
};

export default function SingleWorkFlowResultDeliveryModal({
	show,
	onHide,
	onSuccess,
	item,
	employeeid,
}: Props) {
	return (
		<BulkWorkFlowResultDeliveryModal show={show} onHide={onHide}
			onSuccess={onSuccess} employeeid={employeeid} items={item ? [item] : []} />
	);
}