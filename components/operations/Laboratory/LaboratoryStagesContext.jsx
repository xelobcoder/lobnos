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
       const ascensionid = useSearchParams()?.get('ascensionid');
       const patientid = useSearchParams()?.get("patientid");
       const billingid = useSearchParams()?.get("billingid");
       const patientname = useSearchParams()?.get("patientname");
       const parsedStartDate = start_date ? dayjs(start_date).format('YYYY-MM-DD') : '';
       const parsedEndDate = end_date ? dayjs(end_date).format('YYYY-MM-DD') : '';
       const testid = useSearchParams()?.get("testid");

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
              ascensionid: ascensionid || '',
              patientid: patientid || '',
              patientname: patientname || '',
              billingid: billingid || '',
              testid: '',
              sortby: 'DESC',
       });

       const updatePageValue = (value) => {
              setLoadPage(true);
              updatePagination(value, setQueryParams, queryParams);
       };

       const _getAscensionData = async function (ascension_stage, employeeid, branchid, userprovidedCategory) {
              const ascensionid = userprovidedCategory?.ascensionid || queryParams.ascensionid;
              const patientid = userprovidedCategory?.patientid || queryParams.patientid;
              const billingid = userprovidedCategory?.billingid || queryParams.billingid;
              const patientname = userprovidedCategory?.patientname || queryParams.patientname;
              const testid = userprovidedCategory?.testid || queryParams.testid;
              
              const  newQueryParams =  {...queryParams};


              if (billingid || ascensionid || testid) {
                     newQueryParams['_dateEnd']= '';
                     newQueryParams['_dateFrom']= '';
              }
           
              await getAscensionData(ascension_stage, setCollection, newQueryParams, setLoading, employeeid, branchid, category, {
                     ascensionid, patientid, billingid, patientname,testid
              });
       }

       return (
              <LaboratoryContext.Provider value={{
                     collection, setCollection, isLoading, setLoading, queryParams, _getAscensionData, toast,
                     loadCounter, setLoadCounter,
                     setQueryParams, updatePageValue, canloadPage, setLoadPage, category,
                     ascensionid, patientid, billingid,patientname,testid
              }}>
                     {children}

              </LaboratoryContext.Provider>
       );
}


export function useLaboratoryContext() {
       return useContext(LaboratoryContext);
}
