import { customFetch } from "../../Auth/customFetch";

export const DirectFetchResponse = async function (setData,endpoint,setIsLoading) {
    try {
        setIsLoading(true);
        const result = await customFetch(endpoint)
        setData(result);
    } catch (err) {
        setData([])
    } finally {
        setIsLoading(false);
    }
}


