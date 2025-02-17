"use server"
import { redirect } from "next/navigation";
import { loadOptions } from "../../lib/appointment";
import { customFetch, customPost } from "../Auth/customFetch"
import { plsEncryption } from "../../lib/encryption";
import { formatDate } from "../operations/Laboratory/Lib";
export async function filteringDatabaseTables(target: string, filtering: string, column: string, limit: number) {
	try {
		const response = await customFetch(`application/filtering/table/${target}?value=${filtering}&&original=${column}&&limit=${limit}`);
		return response;
	} catch (err) {
		return []
	}
}




export async function pushDatabaseResponseForSavingScheduleMessage(data) {
	const response = await customPost(`sms/schedule/message`, 'POST', data);
	return response;
}


export async function loadClinicianPackage(packageid: number) {
	const response = await customFetch(`clinician-packages/${packageid}`);
	return response;
}


export async function AsyncPatientFilteringloadOptions
	(input = "") {
	return await loadOptions(input);
}



export const handleDatePicker = async ({ branchid, date }) => {
	"use server"
	redirect(`/billing/sales/branches/${plsEncryption(branchid.toString())}?from=${date}&&to=${date}`)
}



export const handleSeverSideProcessing = async (pagination) => {
	const { page, count, from, to } = pagination;
	try {
		const data = await customFetch(
			`billing/payment/info/client?page=${page}&&count=${count}&& from=${from}&& to=${to}`

		);

		if (data.status === "success" && data.statusCode === 200) {
			return { result: data.result, error: false }
		}
		return { result: [], error: false }
	} catch (error) {
		console.error("Error fetching transactions:", error);
		return { result: [], error: true }
	}

}



export const filteringRefundsUsingServiceId = async (value: string | number, employeeid: number): Promise<any[]> => {
	try {
		const servicedId = typeof value === "string" ? parseInt(value) : value;
		const { result } = await customFetch(`billing/filtering/service/refund?serviceid=${servicedId}&&employeeid=${employeeid}`);
		if (result && Array.isArray(result) && result.length > 0) {
			return result
		} else {
			return []
		}
	} catch (err) {
		return []
	}
}



export const loadRefundData = async (status: "pending" | "completed", employeeid: number) => {
	if (status && employeeid) {
		try {
			const response = await customFetch(
				`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=1&&count=10`
			);
			return response?.result || [];
		} catch (err) {
			false
		}
	} else {
		return false
	}
};




export const handleRefundServerSideProcessing = async (values: { count: number; page: number, employeeid: number, status: 'pending' | "completed" }) => {
	const { count, page, employeeid, status } = values;
	try {
		const data = await customFetch(
			`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=${page}&&count=${count}`
		);
		return { result: data.result, error: false };
	} catch (err) {
		console.log(err)
		return { error: "Error loading page data" };
	}
};




export const handleServerSideProcessingAscensionData = async (pagination) => {
	try {
		const { page, count, employeeid, ascension_stage, _dateFrom, _dateEnd, isUltrasound, searchString } = pagination;

		const parsedFrom = _dateFrom ? formatDate(_dateFrom) : _dateFrom;
		const parsedEnd = _dateEnd ? formatDate(_dateEnd) : _dateEnd;
		if (employeeid) {
			const result = await customFetch(
				`operations/ascension/staging?operationsStaging=${ascension_stage}` +
				`&&dateFrom=${parsedFrom}` +
				`&&dateEnd=${parsedEnd}` +
				`&&searchString=${searchString}` +
				`&&page=${page}` +
				`&&count=${count}` +
				`&&isUltrasound=${isUltrasound}` +
				`&&employeeid=${employeeid}`
			);
			if (Array.isArray(result)) {
				return { result, error: false }
			} else {
				return { result: [], error: false }
			}
		}
	} catch (err) {
		return { result: [], error: true }
	}
}



export const getPhelobotomy = async (page: number, count: number) => {
	try {
		const { result } = await customFetch(`test/ascension/pendingCases?count=${count}&&page=${page}`);
		if (Array.isArray(result)) {
			return { result, err: false };
		}
		return { result: [], err: false };
	} catch (error) {
		console.error(error);
		return { result: [], err: true };
	}
};



export const handleSeverSideProcessingPhelobotomy = async (pagination) => {
	const { count, page } = pagination;
	return await getPhelobotomy(page, count);
}



export const handleSeverSideProcessingRejectedSample = async (pagination) => {
	try {
		const { page, count } = pagination;
		const response = await customFetch(`rejected/sample/list?count=${count}&&page=${page}`);
		const { result } = response;
		if (result && Array.isArray(result)) {
			return { result, err: false }
		}
		return { result: [], err: false }
	} catch (err) {
		return { result: false, err: true }
	}
}



export const handleServerSideProcessingSampleValidation = async ({ page, count }) => {
	try {
		const fetchInitialData = await customFetch(`sample/client/list/unvalidated?count=${count}&page=${page}`);
		const { result } = fetchInitialData;
		if (Array.isArray(result))
			if (result && Array.isArray(result)) {
				return { result, err: false }
			}
		return { result: [], err: false }
	} catch (err) {
		return { result: false, err: true }
	}
}




export const handlePaginationServerRejectedHistory = async (pagination) => {
	const { count, page, branchid, ascensionid } = pagination
	try {
		const { data } = await customFetch(`sample/disputed/log/single?ascensionid=${ascensionid}&&branch=${branchid}&&page=${page}&&count=${count}`);
		if (Array.isArray(data)) {
			return { result: data, error: false }
		}
		return { result: [], error: false }
	} catch (err) {
		return { result: [], error: true }
	}


}