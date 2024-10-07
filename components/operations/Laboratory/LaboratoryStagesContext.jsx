import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { updatePagination } from "../../Auth/customFetch";
import { getAscensionData } from "./Lib";
const LaboratoryContext = createContext();


export function LaboratoryStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const [queryParams, setQueryParams] = useState({
              _dateFrom: new Date(),
              _dateEnd: new Date(),
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
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData,
                     setQueryParams, updatePageValue, canloadPage, setLoadPage
              }}>
                     {children}

              </LaboratoryContext.Provider>
       );
}


export function useLaboratoryContext() {
       return useContext(LaboratoryContext);
}
