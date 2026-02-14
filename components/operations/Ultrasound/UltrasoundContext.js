import { createContext, useContext, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import { getAscensionData } from "../Laboratory/Lib";
import { updatePagination } from "../../Auth/customFetch";
import { useApplication } from "../../Auth/useApplicationContext";
import { useSearchParams } from "next/navigation";
const UltrasoundContext = createContext({ isLoading: true, collection: [] });


export function UltrasoundStagesProvider({ children }) {
       const [collection, setCollection] = useState([]);
       const [loadCounter, setLoadCounter] = useState(0);
       const [isLoading, setLoading] = useState(true);
       const [canloadPage, setLoadPage] = useState(false);
       const branchid = useApplication().branchid;
       const employeeid = useApplication()?.user?.employeeid;
       const ascensionid = useSearchParams()?.get('ascensionid') || "";
       const patientid = useSearchParams()?.get('patientid') || "";
       const billingid = useSearchParams()?.get('billingid') || "";
       const patientname = useSearchParams()?.get('patientname') || "";
       const category = useSearchParams()?.get('category') || 'ungrouped';

       const today = new Date();
       const yyyy = today.getFullYear();
       const mm = String(today.getMonth() + 1).padStart(2, '0');
       const dd = String(today.getDate()).padStart(2, '0');
       const currentDate = `${yyyy}-${mm}-${dd}`;

       const [queryParams, setQueryParams] = useState({
              _dateFrom: currentDate,
              _dateEnd: currentDate,
              page: 1,
              count: 10,
            branchid,
              employeeid,
                category: category || 'ungrouped',
              isUltrasound: true,
              patientid,
              billingid,
              patientname,
              ascensionid
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage,employeeid,userprovidedCategory) {
              const ascensionid = userprovidedCategory?.ascensionid || queryParams.ascensionid;
              const patientid = userprovidedCategory?.patientid || queryParams.patientid;
              const billingid = userprovidedCategory?.billingid || queryParams.billingid;
              const patientname = userprovidedCategory?.patientname || queryParams.patientname;
              const  newQueryParams =  {...queryParams};

              if (billingid || ascensionid) {
                     newQueryParams['_dateEnd']= '';
                     newQueryParams['_dateFrom']= '';
              }
              await getAscensionData(ascension_stage, setCollection, newQueryParams, setLoading,employeeid,branchid,category,{
                     ascensionid, patientid, billingid, patientname
              });
       }

       return (
              <UltrasoundContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
                     loadCounter, setLoadCounter,
                     setQueryParams, updatePageValue, canloadPage, setLoadPage,category,ascensionid, patientid, billingid,patientname
              }}>
                     <ToastContainer theme="colored" position="top-right" className={'text-sm'} />
                     {children}

              </UltrasoundContext.Provider>
       );
}


export function useUltrasoundContext() {
       return useContext(UltrasoundContext);
}
