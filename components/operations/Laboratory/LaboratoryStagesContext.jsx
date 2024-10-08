import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { updatePagination } from "../../Auth/customFetch";
import { getAscensionData } from "./Lib";
import { ToastContainer, toast } from "react-toastify";
const LaboratoryContext = createContext();


export function LaboratoryStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const [queryParams, setQueryParams] = useState({
              _dateFrom: null,
              _dateEnd: null,
              searchString: '',
              page: 1,
              count: 10
       });

       const updatePageValue = (value) => {
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage) {
              await getAscensionData(ascension_stage, setCollection, queryParams, setLoading);
       }

       return (
              <LaboratoryContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
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
