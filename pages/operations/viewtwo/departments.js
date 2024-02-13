import { useContext, useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/operations/LaboratoryLayout";
import { customFetch, formatTest } from "../../../components/Auth/customFetch";
import Loader from '../../../components/accessories/Loader';
import TableDisplay from '../../../components/accessories/TableDisplay';
import { ProgressBar } from 'react-bootstrap'
import AuthContext from "../../../components/Auth/useAuthentification";


export default function ResultEntryDepartmentViewTwo() {
    const [isLoading, setLoading] = useState(true);
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;
    const [pendingdata, setPending] = useState([]);

    useEffect(() => {
        customFetch('operation/pendingcases/all')
            .then((data) => {
                const { status, statusCode, result } = data;
                if (statusCode == 200 && status == 'success') {
                    setPending(result);
                } else {
                    setPending([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                setPending([])
            })
    }, []);



    const gotoResultEntry = (value) => {
        const { id, name, billingid, patientid } = value;
        if (!id || !name || !employeeid || !billingid || !patientid) return;
        let testname = name.replace(/\s/g, "_").toLowerCase()
        if (name.includes("(") && name.includes(")")) {
            testname = name.slice(0, name.indexOf("("))
        }
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
            Header: 'age', accessor: 'age', Cell: function ({ row, value }) {
                return <div>
                    <span>{value}</span>
                    <br />
                    <span className="border-bottom border-2 border-secondary">{row.original.clientstatus}</span>
                </div>
            }
        },
        {
            Header: 'test category', accessor: "name", Cell: ({ row, value }) => {
                return (
                    <div>
                        <span>{value}</span>
                        <br />
                        <span className="border-bottom border-2 border-secondary">
                            {row.original.department}
                        </span>
                    </div>
                )
            }
        },
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
                            onClick={(ev) => { gotoResultEntryAll(billingid, patientid) }}>
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



    const PendingList = () => {
        if (isLoading) return <Loader />
        else {
            return <TableDisplay column={columns} filtering={true} data={pendingdata} showpage={false} />
        }
    }


    return (
        <LaboratoryLayout>
            <h4>Pending Cases</h4>
            {/* <section className="d-flex mx-2">
                <div>
                    <label className="text-capitalize">department</label>
                    <input className="custom-input" type="text" />
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">department</label>
                    <input className="custom-input" type="text" />
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">department</label>
                    <input className="custom-input" type="text" />
                </div>
                <div className="mx-2">
                    <label className="text-capitalize">department</label>
                    <input className="custom-input" type="text" />
                </div>
            </section> */}
            {PendingList()}
        </LaboratoryLayout>
    )
}