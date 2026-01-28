import { createContext, useContext, useState } from "react";
import { updatePagination } from "../../Auth/customFetch";
import { getAscensionData } from "./Lib";
import { ToastContainer, toast } from "react-toastify";
import { useApplication } from "../../Auth/useApplicationContext";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
const LaboratoryContext = createContext({ isLoading: true, collection: [] });



export function LaboratoryStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [loadCounter, setLoadCounter] = useState(0);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const branchid = useApplication()?.branchid;

       const start_date = useSearchParams()?.get('start_date');
       const end_date = useSearchParams()?.get('end_date');
       const category = useSearchParams()?.get('category');
       const parsedStartDate = start_date ? dayjs(start_date).format('YYYY-MM-DD') : '';
       const parsedEndDate = end_date ? dayjs(end_date).format('YYYY-MM-DD') : '';

       const today = new Date();
       const yyyy = today.getFullYear();
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const dd = String(today.getDate()).padStart(2, '0');
       const currentDate = `${yyyy}-${mm}-${dd}`;

       const [queryParams, setQueryParams] = useState({
              _dateFrom: parsedStartDate || currentDate,
              _dateEnd: parsedEndDate || currentDate,
              searchString: '',
              page: 1,
              count: 10,
              isUltrasound: false,
              category: category || 'grouped',
              branchid: branchid,
              sortby: 'DESC',
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage, employeeid, branchid) {
              await getAscensionData(ascension_stage, setCollection, queryParams, setLoading, employeeid, branchid,category);
       }

       return (
              <LaboratoryContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
                     loadCounter, setLoadCounter,
                     setQueryParams, updatePageValue, canloadPage, setLoadPage,category
              }}>
                     {children}

              </LaboratoryContext.Provider>
       );
}


export function useLaboratoryContext() {
       return useContext(LaboratoryContext);
}
