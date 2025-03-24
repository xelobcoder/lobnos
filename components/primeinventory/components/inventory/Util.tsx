import { customFetch, customPost } from "../../Lib/fetcher";
import { EditingStockItem } from "../interfaces/departmentInterface";

type GetDataAndUpdateStateProps = {
	setfxn: (data: any) => void;
	endpoint: string;
	returner?: boolean;
	loader?: (null | Function);
};

export const getDataAndUpdateState = async function ({
	setfxn,
	endpoint,
	returner,
	loader = null,
}: GetDataAndUpdateStateProps): Promise<any> {
	try {
		if (loader) loader(true);
		const getResponse = await customFetch(endpoint);
		const { statusCode, status, result } = getResponse;
		if (statusCode === 200) {
			if (returner) {
				return result;
			} else {
				setfxn(result);
			}
		}
		if (loader) loader(false);
	} catch (err) {
		if (loader) loader(false);
		alert("Something went wrong");
	}
};

type HandleAssignWareProps = {
	name: string;
	stockid: string;
};

export const handleAssignWare = (data: HandleAssignWareProps, router: any): void => {
	const { name, stockid } = data;
	router.push(`/inventory/stocks/brands?stockname=${name}&&stockid=${stockid}`);
};

type SetCategoryList = (data: any) => void;
export const getcategorylist = async (setCategorylist: SetCategoryList): Promise<void> => {
	getDataAndUpdateState({ setfxn: setCategorylist, endpoint: "stock/category", returner: false });
};

type SetWareHouseList = (data: any) => void;
export const getWareHouseList = async (setWareHouseList: SetWareHouseList): Promise<void> => {
	getDataAndUpdateState({ setfxn: setWareHouseList, endpoint: "inventory/warehouse", returner: false });
};

type SetShelves = (data: any) => void;
export const getShelves = (target: string, setShelves: SetShelves): void => {
	if (!target || !setShelves || typeof setShelves !== 'function') {
		throw new TypeError('target and setShelve update state required');
	}
	getDataAndUpdateState({ setfxn: setShelves, endpoint: `inventory/shelve?target=${target}`, returner: false });
};

export const getWareHouseShelves = async (warehouseid: string | number, setShelve: SetShelves): Promise<void> => {
	if (!warehouseid || !setShelve) return;
	await getDataAndUpdateState({ setfxn: setShelve, endpoint: `inventory/warehouse/shelves?warehouseId=${warehouseid}`, returner: false });
};

type SetState = (data: any) => void;
export const getStocks = async (query: string, stateHolder: SetState): Promise<void> => {
	customFetch(`stock?${query}`)
		.then((data) => { data?.status === "success" && stateHolder(data?.result); })
		.catch((err) => console.log(err));
};

export const Consumptionunitlist: string[] = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box'];
export const Purchaseunitlist: string[] = ['kg', 'g', 'l', 'ml', 'pcs', 'others', 'bottle', 'kit', 'box'];


export const defaultStockDetails: EditingStockItem = {
	name: '',
	category: 0,
	consumptionunit: '',
	categoryname: "",
	stockid: null,
	purchaseunit: '',
	quantity: 0,
	alertlevel: 0,
	materialcode: '',
	warehouse: 0,
	shelf: 0,
};


type PaginationState = { count: number; page: number };
export const updatePagination = (state: PaginationState, action: string | number): PaginationState => {
	const { count, page } = state;
	switch (action) {
		case "increment":
			return { count, page: page + 1 };
		case "decrement":
			if (page > 1) {
				return { count, page: page - 1 };
			}
			return state;
		default:
			return { count, page };
	}
};

export const filterStocks = async (filter: string, warehouseid: string | null, query: { count: number; page: number }, setState: SetState): Promise<void> => {
	if (filter.length < 3) return;
	let endpoint = `stocks/filter?filter=${filter}&&count=${query?.count}&&page=${query.page}`;
	if (warehouseid) {
		endpoint = `${endpoint}&&warehouseid=${warehouseid}`;
	}
	const response = await customFetch(endpoint);
	const { status, statusCode, result } = response;
	if (statusCode == 200 && status == 'success' && Array.isArray(result)) {
		setState(result);
	}
};

export const inventorySettings = {
	alertdays: 21,
	stocksAutoDeduct: true,
	hasMultipleDepartments: true,
	isConnectedToLIMS: true,
	strictBrand: true,
	strictBatchNumber: true,
	lowStockThreshold: 5,
	allowNegativeStock: false,
	autoArchiveExpiredStock: true,
	restrictDepartmentAccess: false,
	emailNotifications: true,
	smsNotifications: false,
	notificationFrequency: "daily",
};

export async function updateInventorySettings(setting: any, toast: any): Promise<void> {
	const push = await customPost('inventory/settings', 'POST', { setting });
	if (push?.status === 'success') {
		toast.success('updates successful', { autoClose: 500 });
	} else {
		toast.error('something wrong occurred', { autoClose: 500 });
	}
}

export async function getInvSettings(): Promise<any> {
	const data = await customFetch('inventory/settings');
	return data;
}


export const getWastageSummary = async function (endpoint: string) {
	try {
		const getResponse = await customFetch(endpoint);
		const { status, result } = getResponse;
		if (status === "success") {
			return { data: result, isLoading: false };
		} else {
			return { data: {}, isLoading: false };
		}
	} catch (err) {
		return { data: {}, isLoading: false };
	}

}