import { createContext, useContext, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import { getAscensionData } from "../Laboratory/Lib";
import { updatePagination } from "../../Auth/customFetch";
import { useApplication } from "../../Auth/useApplicationContext";
const UltrasoundContext = createContext({ isLoading: true, collection: [] });


export function UltrasoundStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [loadCounter, setLoadCounter] = useState(0);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const branchid = useApplication().branchid;
       const employeeid = useApplication()?.user?.employeeid;

       // Set default date to today in yyyy-mm-dd format
       const today = new Date();
       const yyyy = today.getFullYear();
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const dd = String(today.getDate()).padStart(2, '0');
       const currentDate = `${yyyy}-${mm}-${dd}`;

       const [queryParams, setQueryParams] = useState({
              _dateFrom: currentDate,
              _dateEnd: currentDate,
              searchString: '',
              page: 1,
              count: 10,
              branchid: branchid,
              employeeid,
              isUltrasound: true
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage,employeeid) {
              await getAscensionData(ascension_stage, setCollection, queryParams, setLoading,employeeid,branchid);
       }

       return (
              <UltrasoundContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
                     loadCounter, setLoadCounter,
                     setQueryParams, updatePageValue, canloadPage, setLoadPage
              }}>
                     <ToastContainer theme="colored" position="top-right" className={'text-sm'} />
                     {children}

              </UltrasoundContext.Provider>
       );
}


export function useUltrasoundContext() {
       return useContext(UltrasoundContext);
}
