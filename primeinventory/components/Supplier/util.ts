import { SupplierFormValues } from "../../app/purchasemanagement/suppliers/newsuppliers/page";
import { customPost } from "../../Lib/fetcher";
interface SupplierData {
	[key: string]: string | number;
	phonenumber: string | number;
}

export const defaultSupplierdata = {
	name: "",
	address: "",
	region: "",
	contactperson: "",
	email: "",
	phonenumber: "",
}

export const checkEmptyFields = (data: SupplierData): boolean => {
	for (const key in data) {
		if (data[key] === "" || data[key] === " ") {
			return true;
		}
	}
	return false;
};

export const pushNewSupplierInformation = async (
	method: "POST" | "PUT",
	data: SupplierFormValues,
	supplierid?: number
): Promise<boolean | string> => {
	try {
		if (typeof data !== "object" || !method) return false;
		const endpoint = method === "POST"
			? `suppliers`
			: `suppliers?supplierid=${supplierid}`;
		const response = await customPost(endpoint, method, data);
		return response
	} catch (err) {
		return false;
	}
};
