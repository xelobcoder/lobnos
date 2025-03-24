export type DepartmentList = {
    id: number,
    employeeid: number,
    departmentManager: string,
    date: string,
    department: string
}


export type DepartmentSummaryPendingItem = DepartmentList & {
    departmentid?: number, pending: number
}



export type stockConsumptionType = {
    departmentid: number,
    stockid: number,
    stockname: string,
    quantityAvailable: number,
    quantity?: number,
}


export type authMini = { username: string, employeeid: number, role: string }

interface SubLink {
    title: string;
    link: string;
}

export interface SidebarLinkType {
    title: string;
    link: string;
    icon?: string,
    subLinks?: SubLink[];
}
type StockItem = {
    id: number;
    date: string;
    name: string;
    comsumptionunit: string;
    quantity_requested: number;
    brand: string;
    batchnumber: string;
    status: string;
    quantity_approved: number | null;
    quantityReceived: number;
}

type captionDepartment = "pending" | "accepted" | "rejected" | "approved" | "received"


export type DepartmentPlaceOrderStockType = {
    stockid: number;
    name: string;
    categoryname: string;
    consumptionunit: string;
    quantity: number;
    quantityrequired: number;
};

export type QuarterlyDataBarChart = {
    month: number;
    debitAmount: number;
};

export type GeneralLosessSummaryType = {
    firstQ: number,
    secondQ: number,
    totalWastage: number,
    thirdQ: number
}
export interface WastageData {
    firstQ?: number;
    secondQ?: number;
    thirdQ?: number;
}

export interface QueryState {
    count: number;
    page: number;
}

export interface QuarterlyDataType {
    name: string;
    brand: string;
    batchnumber: string;
    receiveddate?: string;
    expirydate?: string;
    debitdate?: string;
    pricing: string;
    price: number;
    debitqty: number;
    debitAmount: number;
}




export type WareHouseType = {
    id: string;
    name: string;
}

export type EditingStockItem = {
    stockid: number | null;
    name: string;
    categoryname: string;
    purchaseunit: string;
    consumptionunit: string;
    quantity: number;
    alertlevel: number
    warehouse?: number;
    category: number;
    materialcode?: string;
    shelf?: number;
}


export type StockEditingState = {
    edit: boolean;
    stockId: number | null;
    data: EditingStockItem | null
}