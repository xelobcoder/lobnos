import { Search } from "@mui/icons-material";
import OperationsListTestCollection from "./OperationsListTestCollection";
import ResultEntryComponent from "./ResultEntryComponent";
import { useSearchParams } from "next/navigation";
import { useCallback, useContext, useEffect } from "react";
import AuthContext from "../../Auth/useAuthentification";
import { useOperation } from "./ContextOperations/useOperation";
import { customFetch } from "../../Auth/customFetch";

export default function PatientResultEntryFormComponentNew({ }) {

    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;
    const billingid = useSearchParams().get("csvid");
    const unslicedPatientid = useSearchParams().get("ptid");
    const { operations, updateContext } = useContext(useOperation);
    const { toast } = operations;

    const loadInitData = useCallback(async () => {
        if (unslicedPatientid && billingid && employeeid) {
            try {
                let test = await customFetch(`result/entry/record/collection?csvid=${billingid}&&ptid=${unslicedPatientid}&&target=${[70, 50].join(",")}&&branchid=${auth.branchid}`)
                let patient_data = customFetch(`register/personalinformation?patientid=${unslicedPatientid.slice(50)}`);

                const data = await Promise.all([test, patient_data]);
                test = data[0];
                patient_data = data[1];
                const { test: testResult } = test;
                const { result } = patient_data;

                updateContext({
                    ...operations,
                    patientInfo: result,
                    testList: testResult || [],
                    billingid,
                    patientid: unslicedPatientid,
                    employeeid,
                    initDataLoading: false,
                });
            } catch (err) {
                updateContext({ ...operations, initDataLoading: true });
                toast.error("something wrong occured please");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unslicedPatientid, billingid, employeeid]);

    useEffect(() => {
        loadInitData();
    }, [loadInitData]);


    const { patientInfo, initDataLoading, showPatientData } = operations;
    const { firstname, lastname, middlename, dob, gender, mobile_number, patientid } =
        patientInfo;

    if (initDataLoading) return <h5>Loading............</h5>;
    if (!showPatientData) return;

    return (
        <div className="result-entry-layout">
            <div className="result-entry-sidebar bg-light">
                <div className="patient-filtering">
                    <div className="pt-filtering-content">
                        <div>
                            <input className="custom-input" type="text" placeholder="enter patientid billingid here" />
                        </div>
                        <button className="btn btn-primary mx-2">
                            <Search />
                        </button>
                    </div>
                </div>
                <div className="patient-data">
                    <div className="pt-content p-2">
                        <div className="bg-info-subtle br-5 p-1">
                            <p className="text-uppercase">{firstname} {middlename} {lastname}</p>
                            <hr />
                            <div className="grid-50">
                                <div>
                                    <span className="text-sm">DOB:{new Date(dob).toLocaleDateString()}</span><br />
                                    <span className="text-sm text-capitalize">Gender:{gender}</span><br />
                                    <span className="text-sm text-capitalize">ID:{patientid}</span>
                                </div>
                                <div>
                                    <span className="text-sm">mobile:{mobile_number}</span><br />
                                    <span className="text-sm text-capitalize">ID:{patientid}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="result-test-collection p-2">
                    <OperationsListTestCollection />
                </div>
            </div>
            <div className="result-entry-wrapper">
                <ResultEntryComponent />
            </div>
        </div>
    )
}