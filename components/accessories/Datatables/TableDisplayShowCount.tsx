import { Dispatch, SetStateAction } from "react";

export default function ShowTableDisplayCount({
     handleLoader,
     page,
     setQueryParams,
     setLoader,
     queryParams
}: {
     handleLoader: ((count: number, page: number, sortby: 'DESC' | 'ASC') => Promise<void | { result: any, error: any }>) | null
     page: number;
     queryParams: { count: number, page: number, sortby: 'DESC' | 'ASC' };
     setLoader: Dispatch<SetStateAction<boolean>>;
     setQueryParams: Dispatch<SetStateAction<{ count: number, page: number, sortby: 'DESC' | 'ASC' | '' }>>;
}) {
     const handleCountChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
          const value = Number(ev.target.value);
          setQueryParams({ ...queryParams, count: value });
          setLoader(true);
          if (typeof handleLoader == "function") {
               await handleLoader(page, value, queryParams.sortby);
          }
     };

     return (
          <div className="my-1 col-12 col-sm-6 col-md-6 col-lg-6 d-flex flex-column">
               <div className="d-flex w-100">
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
                    <select className="custom-select mx-3" onChange={(e) => {
                         const sortby = e.target.value as '' | 'DESC' | 'ASC';
                         setQueryParams({ ...queryParams, sortby });
                         if (handleLoader && (sortby === 'DESC' || sortby === 'ASC')) {
                              handleLoader(page, queryParams.count, sortby);
                         }
                    }}>
                         <option value=''>Select option</option>
                         <option value='DESC'>Descending(Show Newest data first)</option>
                         <option value='ASC'>Ascending (Show oldest data last)</option>
                    </select>
               </div>
               <small className="text-muted mt-1 ms-1 text-light">Server-side filtering.</small>
          </div>
     );
}
