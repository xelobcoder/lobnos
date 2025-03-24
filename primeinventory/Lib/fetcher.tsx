import { SetStateAction, ChangeEvent, Dispatch } from "react"

/**
 * Sends an HTTP request to the specified endpoint and returns the response as JSON.
 *
 * @param {string} endpoint - The endpoint URL to send the request to.
 * @returns {Promise<object>} - The response from the server as JSON.
 */
export async function customFetch(endpoint: string) {
    try {
        let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
            cache: 'no-cache', headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "cache-control": "no-store"
            },
        },)
        const source = await response.json()
        const { status, message } = source
        if (status == 401 && message == "Unauthorized") {
            window.location.href = "/authentication/login"
        } else {
            return source
        }
    } catch (err) {
        console.log(err)
    }
}
export async function limsfetch(endpoint: string) {
    try {
        let response = await fetch(`${process.env.LIMS_CONNECTION_ENDPOINT}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "cache": "no-cache,must-revalidate,no-store,max-age=60,s-maxage=0"
            },
        })
        const source = await response.json()
        return source
    } catch (err) {
        console.log(err)
    }
}
export const generateRandomTextAndNumbers = (length = 10) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}



export const getDataAndUpdateState = async function (setfxn: Function, endpoint: string, returner?: Function | null, loader?: Function | null) {
    try {
        if (loader) loader(true)
        const getResponse = await customFetch(endpoint)
        const { statusCode, status, result } = getResponse
        if (statusCode == 200) {
            if (returner) {
                return result
            } else {
                setfxn(result)
            }
        }
        if (loader) loader(false)
    } catch (err) {
        if (loader) loader(false)
        alert("something went wrong")
    }
}


export const customData = async (endpoint: string, setData: SetStateAction<any>) => {
    const response = await customFetch(endpoint)
    const { statusCode, status, result } = response
    if (statusCode == 200 && status == "success") {
        setData(result)
    } else setData(result)
}


/**
 * Sends a POST request to a specified endpoint with the provided data.
 * Includes necessary headers and authorization token.
 * Parses the response and checks for a specific status and message.
 * If the status is 401 and the message is "Unauthorized", redirects the user to the login page.
 * Otherwise, returns the parsed response.
 *
 * @param {string} endpoint - The endpoint to send the POST request to.
 * @param {string} method - The HTTP method to use for the request (e.g., "POST", "PUT").
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<object>} - The parsed response from the POST request.
 */
export async function customPost(endpoint: string, method: string, data: any, hash = false) {
    if (process.env.NODE_ENV == "production" && !process.env.NEXT_PUBLIC_ACCESS_TOKEN) {
        throw new Error("NEXT_PUBLIC_ACCESS_TOKEN MISSING")
    }
    var requestBody = data
    if (hash && hash === true) {
        if (process.env.HASH_KEY != undefined) {
            requestBody = {}
        } else {
            throw new Error("HASH_KEY not set in NODE_ENV")
        }
    }
    let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
        method: method,
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
            mode: "no-cors",
        },
        body: JSON.stringify(requestBody),
    })
    let datasource = await response.json()
    const { status, message } = datasource

    if (status == 401 && message == "Unauthorized") {
        window.location.href = "/authentication/login"
    } else {
        return datasource
    }
}

type Query = {
    page: number;
    count: number;
};

type PageValue = number | "increment" | "decrement";

/**
 * Updates pagination state based on the given pageValue.
 * @param pageValue - The value for page adjustment: a number, "increment", or "decrement".
 * @param setQuery - Function to update the query state.
 * @param query - Current query state.
 */
export const updatePagination = (
    pageValue: PageValue,
    setQuery: React.Dispatch<React.SetStateAction<Query>>,
    query: Query
): void => {
    const { count, page } = query;

    if (pageValue === "increment" && page >= 0) {
        setQuery({ ...query, page: page + 1 });
    } else if (pageValue === "decrement" && page > 1) {
        setQuery({ ...query, page: page - 1 });
    } else if (typeof pageValue === "number" && pageValue > 0 && pageValue < 6) {
        setQuery({ ...query, page: pageValue });
    }
};

export const currencyFormatter = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
});



// utils/updateUrlParam.ts

import { useRouter } from 'next/navigation';
import { NextRouter } from "next/router"
import { revalidatePath } from "next/cache"

/**
 * Updates or adds a query parameter in the current URL.
 * @param {string} paramName - The name of the query parameter (e.g., 'stockid').
 * @param {string} paramValue - The value to set for the query parameter.
 */
export function updateUrlParam(router, paramName: string, paramValue: string) {
    const currentUrl = new URL(window.location.href);
    const searchParams = currentUrl.searchParams;
    searchParams.set(paramName, paramValue);
    const updatedUrl = `${currentUrl.pathname}?${searchParams.toString()}`;
    router.push(updatedUrl);
}





export const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    target: string,
    data: Record<string, any>
): Record<string, any> => {
    const { value } = event.target;
    return { ...data, [target]: value };
};

export const handleChangeWithState = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    target: string,
    setData: Dispatch<SetStateAction<Record<string, any>>>,
    data: Record<string, any>
): void => {
    const { value } = event.target;
    setData({ ...data, [target]: value });
};


export const getDateRange = (range: (string | null)[]): [string, string] | undefined => {
    if (Array.isArray(range) && range.length === 2) {
        const [startDate, endDate] = range;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            const formatDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            return [formatDate(start), formatDate(end)];
        }
    }
};
