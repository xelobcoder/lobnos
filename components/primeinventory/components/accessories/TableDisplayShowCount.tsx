import { Dispatch, SetStateAction } from "react";

export default function ShowTableDisplayCount({
    handleLoader,
    page,
    setQueryParams,
    setLoader,
    queryParams
}: {
    handleLoader: ((count: number, page: number) => Promise<void | { result: any, error: any }>) | null
    page: number;
    queryParams: { count: number, page: number };
    setLoader: Dispatch<SetStateAction<boolean>>;
    setQueryParams: Dispatch<SetStateAction<{ count: number, page: number }>>;
}) {
    const handleCountChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(ev.target.value);
        setQueryParams({ ...queryParams, count: value });
        setLoader(true);
        if (typeof handleLoader == "function") {
            await handleLoader(page,value);
        }
    };

    return (
        <div className="my-1 col-12 col-sm-6 col-md-4 col-lg-3">
            <select value={queryParams.count} onChange={handleCountChange} className="custom-select">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
                <option value={35}>35</option>
                <option value={40}>40</option>
                <option value={45}>45</option>
                <option value={50}>50</option>
            </select>
        </div>
    );
}
