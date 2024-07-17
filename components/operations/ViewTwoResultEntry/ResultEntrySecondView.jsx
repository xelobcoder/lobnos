import { useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { customFetch } from "../../Auth/customFetch";
import PatientData from "./OperationsPatientData";
import { Stack } from "react-bootstrap";
import AuthContext from "../../Auth/useAuthentification";
import { useOperation } from "./ContextOperations/useOperation";
import ResultEntryComponent from "./ResultEntryComponent";
import OperationsListTestCollection from "./OperationsListTestCollection";

export default function ResultEntryPanelSecondView() {
  const{ auth }= useContext(AuthContext);
  const employeeid = auth?.employeeid;
  const billingid = useSearchParams().get("csvid");
  const patientid = useSearchParams().get("ptid");
  const { operations, updateContext } = useContext(useOperation);
  const { toast, minifyClientInfo, uiLayout } = operations;

  const loadInitData = useCallback(() => {
    if (patientid && billingid && employeeid) {
      customFetch(`result/entry/record/collection?csvid=${billingid}&&ptid=${patientid}&&target=${[70, 50].join(",")}`)
        .then((data) => {
          const { personal_data, test } = data;
          updateContext({
            ...operations,
            patientInfo: personal_data,
            testList: test || [],
            billingid,
            patientid,
            employeeid,
            initDataLoading: false,
          });
        })
        .catch((err) => {
          updateContext({ ...operations, initDataLoading: true });
          toast.error("something wrong occured please");
        })
        .finally(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientid, billingid,employeeid]);

  useEffect(() => {
    loadInitData();
  }, [loadInitData]);

  return (
    <div>
      <Stack className={uiLayout == 3 ? "three-layer-card" : "two-layer-card "}>
        <div id="patient-data">
          <PatientData />
          {!minifyClientInfo && (
            <span
              onClick={(ev) => {
                updateContext({ ...operations });
              }}
              className="slide-left-span pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M13.9142 12L18.7071 7.20712L17.2929 5.79291L11.0858 12L17.2929 18.2071L18.7071 16.7929L13.9142 12ZM7 18V6.00001H9V18H7Z"></path>
              </svg>
            </span>
          )}
        </div>
        <div>
          <div>
            <OperationsListTestCollection />
            <span
              onClick={(ev) => {
                updateContext({ ...operations,...auth, minifyClientInfo: false });
              }}
              className="slide-rigth pointer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                <path d="M10.0858 12L5.29291 16.7929L6.70712 18.2071L12.9142 12L6.70712 5.79291L5.29291 7.20712L10.0858 12ZM17 6.00002L17 18H15L15 6.00002L17 6.00002Z"></path>
              </svg>
            </span>
          </div>
        </div>
        <div className={`my-2 `}>
          <ResultEntryComponent />
        </div>
      </Stack>
    </div>
  );
}
