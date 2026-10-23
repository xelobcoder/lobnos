import { Dispatch, SetStateAction, useState } from "react";
import styles from './PrimeTable.module.css';

export default function ShowTableDisplayCount({
     handleLoader,
     page,
     setQueryParams,
     setLoader,
     queryParams
}: {
     handleLoader: ((count: number, page: number, sortby: 'DESC' | 'ASC') => Promise<void | { result: any, error: any }>) | null
     page: number;
     queryParams: { count: number | 'custom', page: number, sortby: 'DESC' | 'ASC' };
     setLoader: Dispatch<SetStateAction<boolean>>;
     setQueryParams: Dispatch<SetStateAction<{ count: number | 'custom', page: number, sortby: 'DESC' | 'ASC' | '' }>>;
}) {
     const [isCustomMode, setIsCustomMode] = useState(false);
     const [customValue, setCustomValue] = useState('');

     const handleCountChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
          const value = ev.target.value;
          if (value === 'custom') {
               setIsCustomMode(true);
               setCustomValue('');
          } else {
               setIsCustomMode(false);
               const numValue = Number(value);
               setQueryParams({ ...queryParams, count: numValue });
               setLoader(true);
               if (typeof handleLoader == "function") {
                    await handleLoader(page, numValue, queryParams.sortby);
               }
          }
     };

     return (
          <div className={styles.countControl}>
               <span>Rows per page</span>
               <div className="d-flex w-100">
                    <select aria-label="Rows per page" value={isCustomMode ? 'custom' : queryParams.count} onChange={handleCountChange} className="form-select form-select-sm">
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
                         <option value={100}>100</option>
                         <option value={200}>200</option>
                         <option value={500}>500</option>
                         <option value={1000}>1000</option>
                         <option value="custom">Custom...</option>
                    </select>
                    {isCustomMode && (
                         <div className="d-flex ms-2">
                              <input
                                   type="number"
                                   min={1}
                                   className="form-control form-control-sm"
                                   style={{ width: 80 }}
                                   placeholder="Enter count"
                                   aria-label="Custom rows per page"
                                   value={customValue}
                                   onChange={e => {
                                        setCustomValue(e.target.value);
                                   }}
                                   onKeyPress={e => {
                                        if (e.key === 'Enter') {
                                             const value = Number(customValue);
                                             if (value > 0) {
                                                  setQueryParams({ ...queryParams, count: value });
                                                  setLoader(true);
                                                  if (typeof handleLoader == "function") {
                                                       handleLoader(page, value, queryParams.sortby);
                                                  }
                                             }
                                        }
                                   }}
                              />
                              <button
                                   type="button"
                                   className="btn btn-primary btn-sm ms-1"
                                   style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                   onClick={() => {
                                        const value = Number(customValue);
                                        if (value > 0) {
                                             setQueryParams({ ...queryParams, count: value });
                                             setLoader(true);
                                             if (typeof handleLoader == "function") {
                                                  handleLoader(page, value, queryParams.sortby);
                                             }
                                        }
                                   }}
                                   disabled={!customValue || Number(customValue) <= 0}
                              >
                                   Apply
                              </button>
                         </div>
                    )}
                    <select className="form-select form-select-sm mx-3" onChange={(e) => {
                         const sortby = e.target.value as '' | 'DESC' | 'ASC';
                         setQueryParams({ ...queryParams, sortby });
                         if (handleLoader && (sortby === 'DESC' || sortby === 'ASC') && typeof queryParams.count === 'number') {
                              handleLoader(page, queryParams.count, sortby);
                         }
                    }}>
                         <option value=''>Select option</option>
                         <option value='DESC'>Descending(Show Newest data first)</option>
                         <option value='ASC'>Ascending (Show oldest data last)</option>
                    </select>
               </div>
          </div>
     );
}
