import { useCallback, useContext, useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/operations/LaboratoryLayout";
import { ProgressBar } from 'react-bootstrap'
import AuthContext from "../../../components/Auth/useAuthentification";
import UsePaginationTableDisplay from "../../../components/accessories/usePaginationTableDisplay";
import { formatTest, getDataAndUpdateState, getDepartment } from "../../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";

export default function ResultEntryDepartmentViewTwo() {
    const urlQuery = useSearchParams();
    const status = urlQuery.get("status");
    const dept = urlQuery.get("department");
    const [department, setDepartment] = useState([]);
    const [endpoint, setEndpoint] = useState('operation/pendingcases/all');
    const [alltest, setAlltest] = useState([]);
    const [pendingdata, setPending] = useState([]);
    const [isupdate, setUpdate] = useState(false);
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;


    useEffect(() => {
        getDepartment(setDepartment);
        getDataAndUpdateState(setAlltest, 'testpanel/list/bulk');
    }, [])


    useEffect(() => {
        if (status && dept) {
            setEndpoint((prev) => {
                return `${prev}?status=${status}&&department=${dept}`
            })
        }
    }, [status, dept])

    const gotoResultEntry = (value) => {
        const { id, name, billingid, patientid } = value;
        if (!id || !name || !employeeid || !billingid || !patientid) return;
        let testname = formatTest(name);
        window.open(`/operations/viewtwo/resultentry?testid=${id}&&testname=${testname}&&employeeid=${employeeid}&&billingid=${billingid}&&patientid=${patientid}&&view=single`);
    }


    const gotoResultEntryAll = (billingid, patientid) => {
        if (!billingid || typeof billingid != "number" || !patientid || typeof patientid != "number") return;

        const matcheddata = pendingdata.filter((item, index) => item.billingid === billingid && patientid === item.patientid);

        if (matcheddata.length == 0) return;

        const testnames = matcheddata.map((a, i) => formatTest(a.name)).join(",");
        const testids = matcheddata.map((a, i) => a.id).join(",");

        window.open(`/operations/viewtwo/resultentry?testid=${testids}&&testname=${testnames}&&employeeid=${employeeid}&&billingid=${billingid}&&patientid=${patientid}&&view=multiple`);
    }


    const columns = [
        {
            Header: 'Client name', accessor: 'fullname', Cell: function ({ row, value }) {
                return (
                    <div className="p-0 m-0">
                        <span>{value}</span>
                        <br />
                        <span className="border-bottom border-2 border-secondary">Billingid {" : "}{row.original.billingid}</span>
                    </div>
                )
            }
        },
        {
            Header: 'patientid', accessor: 'patientid'
        },
        {
            Header: 'age', accessor: 'age', width: 50
        },
        { Header: 'department', accessor: 'department' },
        { Header: 'test', accessor: "name" },
        {
            Header: 'sample status', accessor: 'approvalstatus', Cell: function ({ value }) {
                return (
                    <div>
                        {value == 1 ? <span className="bg-success text-sm text-white">approved</span> : <span className="bg-danger text-white text-sm">rejected</span>}
                    </div>
                )
            }
        },
        {
            Header: 'completed', accessor: 'ready', Cell: function ({ row }) {
                const { processing, ready } = row.original;
                return (
                    <div>
                        <span>{processing && ready == "true" ? "processed" :
                            processing == "true" && ready == "false" ? "processing" :
                                "No"
                        }</span>
                        <br />
                        <span>Result Entered {":"} {row.original.ready == "true" ?
                            <ProgressBar now={100} style={{ width: '100px' }} variant="success" />
                            :
                            <ProgressBar now={100} style={{ width: '100px' }} variant="danger" />}</span>
                    </div>
                )
            }
        },
        {
            Header: 'referals', accessor: 'clinician', Cell: function ({ value, row }) {
                const { clinicianName, organization } = row.original;
                return (
                    <div>
                        <span>Clinician: {value == 0 ? "Self" : clinicianName}</span>
                        <br />
                        <span>
                            Organization: {organization == 0 ? 'Direct' : organization}
                        </span>
                    </div>
                )
            }
        },
        {
            Header: 'actions', accessor: 'actions', width: 300, Cell: function ({ row, value }) {
                const { billingid, patientid } = row.original;
                return (
                    <div>
                        <button className="btn btn-primary  btn-sm"
                            onClick={(ev) => { gotoResultEntry(row.original) }}>
                            result
                        </button>
                        <button className="btn btn-primary  btn-sm mx-2"
                            onClick={(esv) => { gotoResultEntryAll(billingid, patientid) }}>
                            result all
                        </button>
                        <button className="btn btn-primary  btn-sm mx-2">
                            preview
                        </button>
                    </div>
                )
            }
        }
    ]



    const getdata = useCallback(async (value) => {
        setPending(value);
    }, [])


    const handleDepartmentChange = async (ev) => { }


    return (
        <LaboratoryLayout>
            <section className="d-flex mx-2">
                <div>
                    <label className="text-capitalize">department</label>
                    <select className="custom-select br-0" onChange={(ev) => handleDepartmentChange(ev)}>
                        <option>select a department</option>
                        <option value='all'>all</option>
                        {department.map((item, index) => <option value={item.id} key={index}>{item.department}</option>)}
                    </select>
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">Cases</label>
                    <select className="custom-select br-0">
                        <option value='all'>all cases</option>
                        <option value='pending'>pending cases</option>
                        <option value='completed'>completed cases</option>
                    </select>
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">test</label>
                    <select className="custom-select br-0">
                        <option value>None</option>
                    </select>
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">filter</label>
                    <br />
                    <button className="btn btn-primary btn-sm">
                        search
                    </button>
                </div>
            </section>
            <UsePaginationTableDisplay
                column={columns}
                endpoint={endpoint}
                update={isupdate}
                updatedata={pendingdata}
                getdata={getdata}
            />
        </LaboratoryLayout>
    )
}