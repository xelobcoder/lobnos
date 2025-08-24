interface QueryParams {
    count: number;
    page: number;
    name: string;
    email: string;
    sortby: string;
    role: string;
    contact: string;
}

interface FetchResult {
    result: any[];
    error: boolean;
}
