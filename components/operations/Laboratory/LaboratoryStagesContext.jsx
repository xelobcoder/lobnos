import { createContext, useContext, useState } from "react";
import { updatePagination } from "../../Auth/customFetch";
import { getAscensionData } from "./Lib";
import { ToastContainer, toast } from "react-toastify";
const LaboratoryContext = createContext({ isLoading: true, collection: [] });


export function LaboratoryStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [loadCounter, setLoadCounter] = useState(0);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
      
       
       const [queryParams, setQueryParams] = useState({
              _dateFrom: null,
              _dateEnd: null,
              searchString: '',
              page: 1,
              count: 10,
              isUltrasound: false,
              branchid:null
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
                     <ToastContainer theme="colored" position="top-right" className={'text-sm'} />
                     {children}

              </LaboratoryContext.Provider>
       );
}


export function useLaboratoryContext() {
       return useContext(LaboratoryContext);
}
