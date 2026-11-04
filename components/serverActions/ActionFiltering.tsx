
import { loadOptions } from "../../lib/appointment";
import { customFetch, customPost } from "../Auth/customFetch"
import { plsEncryption } from "../../lib/encryption";
import { formatDate } from "../operations/Laboratory/Lib";
import { CommissionAssignmentParams, getCommissionAssignments } from "../../lib/commission/commissionApi";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export interface RequestPagination {
    page?: number; count?: number; branchid?: string | number; employeeid?: string | number;
    from?: string; to?: string; startDate?: string; endDate?: string; sortby?: string; sortBy?: string;
    _dateFrom?: string | null; _dateEnd?: string | null; ascension_stage?: string | number;
    billingid?: string | number; patientid?: string | number; ascensionid?: string | number;
    patientname?: string; testid?: string | number; isUltrasound?: boolean | number;
    searchString?: string; category?: string | number; filter?: string; sorting?: string;
    status?: string; jobid?: string | number; fullname?: string; isPatientSpecific?: boolean;
}
export async function filteringDatabaseTables(target: string, filtering: string, column: string, limit: number) {
	try {
		const response = await customFetch(`application/filtering/table/${target}?value=${filtering}&&original=${column}&&limit=${limit}`);
		return response;
	} catch (err) {
		return []
	}
}




export async function pushDatabaseResponseForSavingScheduleMessage(data: object) {
	const response = await customPost(`sms/schedule/message`, 'POST', data);
	return response;
}


export async function loadClinicianPackage(packageid: number) {
	const response = await customFetch(`clinician-packages/${packageid}`);
	return response;
}


export async function AsyncPatientFilteringloadOptions
	(input = "") {
	return await loadOptions(input, 'firstname');
}



export const handleDatePicker = async ({ branchid, date, from, to }: { branchid: string; date: string; from: string; to: string; }, router: AppRouterInstance|string[]) => {
	router.push(`/billing/sales/branches/${plsEncryption(branchid.toString())}?from=${from}&&to=${to}`)
}



export const handleSeverSideProcessing = async (pagination: RequestPagination) => {
	const { page, count, from, to, branchid } = pagination;
	try {
		const data = await customFetch(
			`billing/payment/info/client?page=${page}&&count=${count}&&from=${from}&&to=${to}&&branchid=${branchid}`
		);
		if (data.status === "success" && data.statusCode === 200 && Array.isArray(data.data) && data.data.length > 0) {
			return { result: data.data, error: false }
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




export const handleRefundServerSideProcessing = async (values: { count: number; page: number, employeeid: number, status: 'pending' | "completed", sortby: 'ASC' | 'DESC' }) => {
	const { count, page, employeeid, status, sortby = 'DESC' } = values;
	try {
		const data = await customFetch(
			`billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=${page}&&count=${count}&&sortby=${sortby}`
		);
		return { result: data.result, error: false };
	} catch (err) {
		console.log(err)
		return { error: "Error loading page data" };
	}
};




export const handleServerSideProcessingAscensionData = async (pagination: RequestPagination) => {
	try {
		const { page, count, employeeid, ascension_stage, _dateFrom, billingid, patientid, ascensionid, patientname, testid, _dateEnd, isUltrasound, searchString, category, sortby = 'DESC' } = pagination;

		const parsedFrom = _dateFrom ? formatDate(_dateFrom) : _dateFrom;
		const parsedEnd = _dateEnd ? formatDate(_dateEnd) : _dateEnd;
		if (employeeid) {
			const result = await customFetch(
				`operations/ascension/staging?operationsStaging=${ascension_stage}` +
				`&&dateFrom=${parsedFrom}` +
				`&&dateEnd=${parsedEnd}` +
				`&&page=${page}` +
				`&&count=${count}` +
				`&&isUltrasound=${isUltrasound}` +
				`&&employeeid=${employeeid}` +
				`&&sortby=${sortby}` +
				`&&grouped=${category}` +
				`&&billingid=${billingid}` +
				`&&patientid=${patientid}` +
				`&&ascensionid=${ascensionid}` +
				`&&patientname=${patientname}` +
				`&&testid=${testid}`
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



export const handleSeverSideProcessingPhelobotomy = async (pagination: RequestPagination) => {
	try {
		const { filter, page, count, _dateFrom, _dateEnd, sortby = "DESC" } = pagination;
		const { result } = await customFetch(`test/ascension/pendingCases?count=${count}&&page=${page}&&filter=${filter}&&start_date=${_dateFrom}&&end_date=${_dateEnd}&&sortby=${sortby}`);
		if (Array.isArray(result)) {
			return { result, err: false };
		}
		return { result: [], err: false };
	} catch (error) {
		return { result: [], err: true };
	}
}



export const handleSeverSideProcessingRejectedSample = async (pagination: RequestPagination) => {
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



export const handleServerSideProcessingSampleValidation = async ({ page, count, startDate, endDate, sortBy }: RequestPagination) => {
	try {
		const fetchInitialData = await customFetch(`sample/client/list/unvalidated?count=${count}&page=${page}&&startDate=${startDate}&&endDate=${endDate}&&sortby=${sortBy}`);
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




export const handlePaginationServerRejectedHistory = async (pagination: RequestPagination) => {
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


export const handleServerTurnAroundTime = async (paginate: RequestPagination) => {
	try {
		const { page, count, sorting, sortby = 'DESC' } = paginate
		const response = await customFetch(`testascension/tat-data?page=${page}&&count=${count}&&sorting=${sorting}&&sortby=${sortby}`);
		if (response?.data && Array.isArray(response?.data)) {
			return { result: response?.data, error: false }
		}
		return { result: [], error: true }
	} catch (err) {
		return { result: [], error: true }
	}
}


export const orgainzationServerSideProcessing = async (paginate: { page: number, count: number }) => {
	try {
		const url = `organizations/details?count=${paginate.count}&page=${paginate.page}`
		const result = await customFetch(url);
		if (result.statusCode === 200 && Array.isArray(result.result)) {
			return { result: result.result, error: false };
		}
		return { result: [], error: true };
	} catch (err) {
		return { result: [], error: true };
	}

}


interface FetchParams {
	testid: string;
	billingid: string;
	patientid: string;
	ascensionid: string;
	employeeid?: number;
}


export const getResultEntryDataServerSide = async ({
	testid,
	billingid,
	patientid,
	ascensionid, employeeid
}: FetchParams): Promise<[resultResponse: any, commentsResponse: any]> => {
	const commentsUrl = `testpanel/list/customtestrule/previous/comments?testid=${testid}&csvid=${billingid}&ptid=${patientid}`;
	const testResultUrl = `testpanel/list/customtestrule/previous?testid=${testid}&ptid=${patientid}&csvid=${billingid}&&ascensionid=${ascensionid}&&employeeid=${employeeid}`;

	const [commentsResponse, resultResponse] = await Promise.all([
		customFetch(commentsUrl),
		customFetch(testResultUrl),
	]);
	return [resultResponse, commentsResponse];
};




interface FetchParams {
	billingid: string;
	ascensionid: string;
	testid: string;
	patientid: string;
}

export const getAscensionEditCountServerideS = async ({
	billingid,
	ascensionid,
	testid,
	patientid,
}: FetchParams): Promise<number | undefined> => {
	try {
		const result = await customFetch(
			`ascension/edit/count?csvid=${billingid}&ascensionid=${ascensionid}&testid=${testid}&ptid=${patientid}`
		);
		return result?.count;
	} catch (err) {
		console.error(err);
		throw err;
	}
};






export const buildLoginQueryServerSide = async (
	query: QueryParams
): Promise<FetchResult> => {
	try {

		const queryParams = new URLSearchParams({
			count: String(query.count),
			page: String(query.page),
			name: query.name,
			email: query.email,
			sortby: query.sortby || 'DESC',
			role: query.role,
			contact: query.contact,
		});


		const { result } = await customFetch(`logins?${queryParams.toString()}`);

		if (Array.isArray(result)) {
			return { result, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
};




export const handleLoginHistoryServerProcessing = async (pagination: { count: number, page: number, employeeid: number }) => {
	try {
		const { count, page, employeeid } = pagination;
		const data = await customFetch(`security/users/getlogin/history?page=${page}&&count=${count}&&employeeid=${employeeid}`);
		if (Array.isArray(data)) {
			return { result: data, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
}


export const handleServerSideQCSessions = async (pagination: { count: number, page: number, employeeid: number }) => {
	try {
		const { count, page, } = pagination;
		const response = await customFetch(`qc-sessions?limit=${count}&page=${page}`);
		if (response && response.data && Array.isArray(response.data)) {
			return { result: response.data, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true }
	}

}



export const ClinicianAnalyticsCaseSummaryDailyServerSide = async (clinicianId: number, year: number) => {
	try {
		const response = await customFetch(
			`clinician/anal/case-summary/daily/${clinicianId}?year=${year}`
		);
		return response.data
	} catch (err) {
		return []
	}
};






export async function createConditionAction(conditionName: FormDataEntryValue, testid: number, employeeid: number) {
	if (!conditionName || !testid) {
		return false;
	}
	const response = await customPost('multi/definition', 'POST', { conditionName, testid, createdBy: employeeid });
	if (!response) {
		throw new Error("No response from the server.");
	}
	return response
}


export async function noopServerSideHandle(pagination: { page: number, count: number, branchid: number, employeeid: number }) {
	try {
		const { page, count, branchid, employeeid } = pagination
		const response = await customFetch(`expense/merchants?branchid=${branchid}&&employeeid=${employeeid}&&page=${page}&&count=${count}`);
		if (response && Array.isArray(response)) {
			return { result: response, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
}




export async function LoadTestConditionsDefinition(testid: number) {
	try {
		const response = await customFetch(`multi/definition/test/${testid}`);
		return response
	} catch (error) {
		console.error('Failed to fetch conditions:', error);
		return []
	}
}



export async function loadTaskDefinition(pagination: RequestPagination) {
	try {
		const { page, count, sortby = 'DESC' } = pagination;
		const data = await customFetch(`primelims/tasks?page=${page}&&count=${count}&&sortby=${sortby}`);
		if (Array.isArray(data) && data.length > 0) {
			const mappedTasks = data.map(task => ({
				id: task.id,
				title: task.name,
				description: task.description,
				status: task.completed === 0 ? 'Todo' : task.completed === 1 ? 'In Progress' : 'Done',
				priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
				dueDate: new Date(task.endDate).toISOString().split('T')[0],
				assignee: task.username || 'Unassigned',
			}));
			return { result: mappedTasks, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: false }
	}
}





export const handleServerCriticalValues = async (paginate: { page: number; count: number; sortby?: 'DESC' | 'ASC'; status?: 'seen' | 'unseen' }) => {
	try {
		const { page, count, sortby = 'DESC', status } = paginate
		const statusQuery = status ? `&&status=${status}` : '';
		const response = await customFetch(`result/criticalvalues/logging/paginated?sortby=${sortby}&&page=${page}&&count=${count}${statusQuery}`);
		if (response?.data && Array.isArray(response?.data)) {
			const totalCount = Number(response?.total ?? response?.count ?? 0);
			const pageSize = Number(response?.pageSize ?? count);
			const totalPages = totalCount > 0 && pageSize > 0 ? Math.ceil(totalCount / pageSize) : undefined;

			return {
				result: response?.data,
				error: false,
				totalCount: Number.isFinite(totalCount) ? totalCount : undefined,
				totalPages,
			}
		}
		return { result: [], error: true, totalCount: 0, totalPages: 0 }
	} catch (err) {
		return { result: [], error: true, totalCount: 0, totalPages: 0 }
	}
}

export const handleServerRecipientSmsJobs = async (pagination: { page: number, count: number, jobid: number }) => {
	const { page, count, jobid } = pagination;
	try {
		const response = await customFetch(`prime/sms-job-recipients/by-job/${jobid}?page=${page}&&count=${count}`);
		if (response && Array.isArray(response)) {
			return { result: response, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
}

export const handleServerProcessingSmsJobs = async (pagination: { page: number, count: number }) => {
	const { page, count } = pagination;
	try {
		const response = await customFetch(`prime/sms-jobs-paginated?page=${page}&&count=${count}`);
		if (response && Array.isArray(response.jobs)) {
			return { result: response.jobs, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
}

export const handleServerProcessingSmsTemplates = async (pagination: { page: number, count: number }) => {
	const { page, count } = pagination;
	try {
		const response = await customFetch(`prime/sms-templates-paginated?page=${page}&&count=${count}`);
		if (response && Array.isArray(response.templates)) {
			const data = response.templates.map((item: {templateid: string | number; name: string; body: string; category: string; createdbyname?: string; createdby: string | number; createdat: string}) => ({
				id: String(item.templateid),
				name: item.name,
				body: item.body,
				category: item.category,
				createdBy: item.createdbyname || String(item.createdby),
				createdAt: item.createdat,
			}));
			return { result: data, error: false };
		}
		return { result: [], error: false };
	} catch (err) {
		return { result: [], error: true };
	}
}



export const fetchServerSideAppointments = async (pagination: { page: number, count: number, sortby: 'DESC' | 'ASC' }) => {
	try {
		const { page, count, sortby = 'DESC' } = pagination;
		const response = await customFetch(`appointments?page=${page}&count=${count}&&sortby=${sortby}`);
		if (Array.isArray(response)) {
			return { result: response, error: false };
		} else {
			return { result: [], error: false };
		}
	} catch (error) {
		console.error('Error fetching appointments:', error);
		return { result: [], error: true };
	}
};






export const handleServerSidePatientArchives = async (pagination: {
	patientid?: number;
	from?: string;
	to?: string;
	billingid?: string;
	fullname?: string;
	page: number;
	isPatientSpecific?: boolean;
	count: number;
	sortby: 'ASC' | 'DESC'
}) => {
	try {
		const { from, to, billingid, patientid, fullname, page, count, isPatientSpecific = false } = pagination;
		if (isPatientSpecific && !patientid) {
			return { result: [], error: true };
		}
		console.log("Server-side patient archives pagination:", pagination);
		try {
			const trimmedFullname = fullname ? fullname.trim() : "";
			const params = [
				`from=${encodeURIComponent(from == null ? "" : from)}`,
				`to=${encodeURIComponent(to == null ? "" : to)}`,
				`billingid=${encodeURIComponent(billingid == null ? "" : billingid)}`,
				`patientid=${encodeURIComponent(patientid == null ? "" : parseInt(patientid.toString()))}`,
				`fullname=${encodeURIComponent(trimmedFullname)}`,
				`page=${encodeURIComponent(page)}`,
				`count=${encodeURIComponent(count)}`,
				`sortingwise=${encodeURIComponent(pagination?.sortby)}`
			];
			const url = `operations/collection/result?${params.join("&&")}`;
			const response = await customFetch(url);
			const { statusCode, result } = response;
			console.log("Server-side patient archives response:", response, params.join("&&"));
			if (Array.isArray(result) && statusCode === 200) {
				return { result, error: false };
			} else {
				return { result: [], error: false };
			}
		} catch {
			return { result: [], error: true };
		}
	} catch (error) {
		return { result: [], error: true };
	}
}



export const handleSessionGatheringServer = async (pagination: { page: number, count: number, sortby: 'ASC' | 'DESC' }) => {
	try {
		const response = await customFetch(
			`billing/sales/session/list?page=${pagination.page}&count=${pagination.count}&sortby=${pagination.sortby}`
		);
		if (response && response.data && Array.isArray(response.data)) {
			return { result: response.data, error: false }
		} else {
			return { result: [], error: false };
		}
	} catch (error) {
		console.error('Error fetching sessions:', error);
		return { result: [], error: true };
	}
}

export const handleServerSideCommissionAssignments = async (params: CommissionAssignmentParams) => {
	try {
		const response = await getCommissionAssignments(params);
		if (response?.status === "success") {
			return { result: response.result || [], error: false };
		}
		return { result: [], error: false };
	} catch (error) {
		console.error("Error fetching commission assignments:", error);
		return { result: [], error: true };
	}
}

