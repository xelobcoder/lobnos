import { createContext, useContext, useState } from "react";
import { updatePagination } from "../../Auth/customFetch";
import { getAscensionData } from "./Lib";
import { ToastContainer, toast } from "react-toastify";
import { useApplication } from "../../Auth/useApplicationContext";
const LaboratoryContext = createContext({ isLoading: true, collection: [] });


export function LaboratoryStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [loadCounter, setLoadCounter] = useState(0);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const branchid = useApplication().branchid;

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
              isUltrasound: false,
              branchid: branchid,
              sortby: 'DESC',
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage,employeeid,branchid) {
              await getAscensionData(ascension_stage, setCollection, queryParams, setLoading,employeeid,branchid);
       }

       return (
              <LaboratoryContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
                     loadCounter, setLoadCounter,
                            setQueryParams, updatePageValue, canloadPage, setLoadPage
              }}>
                     {children}

              </LaboratoryContext.Provider>
       );
}


export function useLaboratoryContext() {
       return useContext(LaboratoryContext);
}
