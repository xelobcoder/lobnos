import { createContext, useContext, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import { getAscensionData } from "../Laboratory/Lib";
import { updatePagination } from "../../Auth/customFetch";
const UltrasoundContext = createContext({ isLoading: true, collection: [] });


export function UltrasoundStagesProvider({ children }) {
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
              isUltrasound: true
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage,employeeid) {
              await getAscensionData(ascension_stage, setCollection, queryParams, setLoading,employeeid);
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
