import { customFetch } from "../../Auth/customFetch";

export const deliveryMethods = [
	{ value: "whatapp", label: "WhatsApp" },
	{ value: "email", label: "Email" },
	{ value: "hardcopy", label: "Printed copy" },
	{ value: "phonecall", label: "Phone call" },
] as const;
export type DeliveryMethod = typeof deliveryMethods[number]["value"];
export type DeliveryItem = {
	billingid: number | string;
	ascension_id?: number | string;
	ascensionid?: number | string;
	name?: string;
	test_name?: string;
	fullname?: string;
};
export type DeliveryEvent = {
	ascensionid: number;
	mode: string | null;
	when: string | null;
	operator: string | null;
	notes: string | null;
	failure: string | null;
	successful: boolean;
};

export function deliveryItemKey(item: DeliveryItem) {
	return `${item.billingid}:${item.ascension_id ?? item.ascensionid}`;
}

export function positiveDeliveryId(value: unknown): number {
	if ((typeof value !== "number" && typeof value !== "string") || !/^\d+$/.test(String(value)))
		throw new Error("A valid billing and ordered-test identity is required. Refresh the selected tests.");
	const id = Number(value);
	if (!Number.isSafeInteger(id) || id <= 0)
		throw new Error("A valid billing and ordered-test identity is required. Refresh the selected tests.");
	return id;
}

export function normalizedDeliveryMethod(mode: string): string {
	const value = mode.trim().toLowerCase();
	if (value === "whatsapp" || value === "whatapp") return "whatapp";
	if (["hard copy", "hardcopy", "printed copy"].includes(value)) return "hardcopy";
	if (value === "phone call" || value === "phonecall") return "phonecall";
	return value;
}

export function deliveryMethodLabel(mode: string) {
	const value = normalizedDeliveryMethod(mode);
	return deliveryMethods.find(method => method.value === value)?.label || mode;
}

function record(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
function optionalText(value: unknown): string | null {
	if (value == null) return null;
	if (typeof value !== "string") throw new Error("Delivery history contains invalid details. Refresh history before recording a delivery.");
	return value;
}

export async function loadDeliveryHistory(billingid: number): Promise<DeliveryEvent[]> {
	const response: unknown = await customFetch(`result/delivery/chain/${billingid}`);
	if (!record(response) || response.status !== true || Number(response.billingid) !== billingid ||
		!Array.isArray(response.deliveries) || (response.attempts != null && !Array.isArray(response.attempts))) {
		throw new Error(record(response) && typeof response.message === "string"
			? response.message : "Unable to verify delivery history. Please retry before recording a delivery.");
	}
	const events: DeliveryEvent[] = [];
	for (const value of response.attempts ?? []) {
		if (!record(value)) throw new Error("Delivery history contains an invalid record. Please retry.");
		const mode = optionalText(value.delivered_mode);
		const failure = optionalText(value.failure_notes);
		events.push({
			ascensionid: positiveDeliveryId(value.ascensionid),
			mode: mode ? normalizedDeliveryMethod(mode) : null,
			when: optionalText(value.created_at), operator: optionalText(value.username),
			notes: optionalText(value.notes), failure,
			successful: !!mode?.trim() && normalizedDeliveryMethod(mode) !== "not_delivered" && !failure?.trim(),
		});
	}
	// Legacy deliveries may predate attempt storage. A later failed attempt must not hide them.
	for (const value of response.deliveries) {
		if (!record(value)) throw new Error("Delivery history contains an invalid record. Please retry.");
		const ascensionid = positiveDeliveryId(value.ascensionid), rawMode = optionalText(value.delivered_mode);
		if (!rawMode?.trim() || normalizedDeliveryMethod(rawMode) === "not_delivered") continue;
		const mode = normalizedDeliveryMethod(rawMode), when = optionalText(value.delivered_at);
		const represented = events.some(event => event.ascensionid === ascensionid && event.successful &&
			event.mode === mode && (event.when === when || (!!event.when && !!when &&
				new Date(event.when).getTime() === new Date(when).getTime())));
		if (!represented) events.push({
			ascensionid, mode, when, operator: optionalText(value.delivered_by_username),
			notes: optionalText(value.failurenotes) ? null : optionalText(value.notes), failure: null, successful: true,
		});
	}
	return events.sort((a, b) => {
		const first = a.when ? new Date(a.when).getTime() : 0, second = b.when ? new Date(b.when).getTime() : 0;
		return (Number.isFinite(second) ? second : 0) - (Number.isFinite(first) ? first : 0);
	});
}

export function deliveryEventDate(value: string | null) {
	if (!value) return "Date not recorded";
	const date = new Date(value);
	return Number.isFinite(date.getTime()) ? date.toLocaleString() : "Date unavailable";
}
