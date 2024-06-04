import { useCallback, useContext, useEffect, useState } from "react";
import AuthContext from "../../../components/Auth/useAuthentification";
import UsePaginationTableDisplay from "../../../components/accessories/usePaginationTableDisplay";
import { customFetch, formatTest, getDepartment, handleChangeWithState, printResultNavigator } from "../../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { DropdownButton } from 'react-bootstrap';
import { MenuItem } from 'react-bootstrap';
// import { MoreVert } from 'react-bootstrap-icons';

export default function ResultEntryDepartmentViewTwo() {
    const defaultFilters = { departmentid: '', status: '', test: '' };
    const urlQuery = useSearchParams();
    const status = urlQuery.get("status");
    const dept = urlQuery.get("department");
    const [department, setDepartment] = useState([]);
    const [filter, setFilter] = useState(defaultFilters);
    const [endpoint, setEndpoint] = useState('operation/pendingcases/all');
    const [alltest, setAlltest] = useState([]);
    const [pendingdata, setPending] = useState([]);
    const [isupdate, setUpdate] = useState(false);
    const { auth } = useContext(AuthContext);
    const employeeid = auth?.employeeid;

    const getAllTest = async function () {
        if (alltest.length === 0) {
            customFetch('testpanel/list/bulk')
                .then((data) => setAlltest(data?.data))
                .catch((err) => setAlltest([]))
        }
    }

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

    const openSingleResult = (ev, row) => {
        const { billingid, name, id } = row;
        printResultNavigator(null, billingid, { ...row, testid: id, testname: name }, true);
    }

    const openMultipleResult = (ev, row) => {
        const { billingid, name, id ,patientid} = row;
        window.open(`/registration/result/labReportMultiple?billingid=${billingid}&&testid=${id}&&test=${formatTest(name)}&&patientid=${patientid}`)
    }

    const columns = [
        {
            Header: 'Client name', accessor: 'fullname'
        },
        { Header: 'billing id', accessor: 'billingid' },
        {
            Header: 'patientid', accessor: 'patientid'
        },
        {
            Header: 'age', accessor: 'age', 
        },
        {
            Header: 'test', accessor: "name", Cell: ({ row, value }) => {
                return (
                    <div>
                        <span className={row.original.ready == "false" && 'text-danger'}>{value}</span>
                        <br />
                        <span className={`border-bottom border-2 border-dark ${row.original.ready == "false" && 'text-danger'}`}>{row.original.department}</span>
                    </div>
                )
            }
        },
        {
            Header: 'clinician', accessor: 'clinician', Cell: function ({ value, row }) {
                const { clinicianName } = row.original;
                return (
                    <div>
                        <span> {value == 0 ? "Self" : clinicianName}</span>
                    </div>
                )
            }
        },
        {
            Header: 'organization', accessor: 'organization', Cell: function ({ value, row }) {
                const { organization } = row.original;
                return (
                    <div>
                        <span>
                            {organization == 0 ? 'Direct' : organization}
                        </span>
                    </div>
                )
            }
        },
        {
            Header: 'actions', accessor: 'actions', Cell: function ({ row, value }) {
                const { billingid, patientid } = row.original;
                return (
                    <Dropdown>
                        <Dropdown.Toggle size="sm" variant="outline-primary" id="dropdown-basic">
                            {/* <MoreVert /> */} actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item className="text-primary" onClick={(ev) => { gotoResultEntry(row.original) }}> Result Entry</Dropdown.Item>
                            <Dropdown.Item className="text-primary" onClick={(ev) => { gotoResultEntryAll(billingid, patientid) }}>Bulk result entry</Dropdown.Item>
                            {/* {row.original.ready == "true" && <Dropdown.Item className="text-primary">preview</Dropdown.Item>
                            } */}
                            <Dropdown.Item onClick={(ev) => { openSingleResult(ev, row.original) }} className="text-primary" >print single</Dropdown.Item>
                            <Dropdown.Item onClick={(ev) => { openMultipleResult(ev, row.original) }} className="text-primary" >Print Bulk</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )
            }
        }
    ]

    const getdata = useCallback(async (value) => {
        setPending(value);
    }, [])

    const handleFilter = async () => {
        const { departmentid, status, test } = filter;
        let newUrl = `operation/pendingcases/all?departmentid=${departmentid}&&status=${status}&&testid=${test}`;
        setEndpoint(newUrl)
    }

    const clearFilters = () => {
        setFilter({ departmentid: '', status: '', test: '' });
        setEndpoint(`operation/pendingcases/all`)
    }

    return (
        <LaboratoryLayout>
            <div className="">
                <div className="mx-2 text-white p-2 bg-secondary ">
                    <h6>Advanced Filtering</h6>
                </div>
                <section className=" mx-2 d-flex justify-content-between">
                    <div className="col-4">
                        <label>select department</label>
                        <select value={filter.departmentid} onClick={(ev) => { department.length === 0 && getDepartment(setDepartment); }} className="custom-select br-0" onChange={(ev) => handleChangeWithState(ev, 'departmentid', setFilter, filter)}>
                            <option>select a department</option>
                            <option value='all'>all</option>
                            {department.map((item, index) => <option value={item.id} key={index}>{item.department}</option>)}
                        </select>
                    </div>
                    <div className="mx-1 col-3">
                        <label className="text-capitalize">Cases type</label>
                        <select value={filter.status} className="custom-select br-0" onChange={(ev) => { handleChangeWithState(ev, 'status', setFilter, filter) }}>
                            <option value='all'>all cases selected</option>
                            <option value='pending'>pending cases</option>
                            <option value='completed'>completed cases</option>
                        </select>
                    </div>
                    <div className="col-4">
                        <label className="text-capitalize">test list here</label>
                        <select value={filter.test} onChange={(ev) => { handleChangeWithState(ev, 'test', setFilter, filter) }}
                            onClick={(ev) => { getAllTest() }} className="custom-select br-0">
                            <option value='all'>Select a test to filter</option>
                            {alltest.length > 0 && alltest.map((item, index) => { return <option key={index} value={item.id}>{item.name}</option> })
                            }
                        </select>
                    </div>
                </section>
                <section>
                    <div className="d-flex justify-content-between">
                        <div className="mx-2 col-4">
                            <label className="text-capitalize">from</label>
                            <input type="date" className="custom-input br-0" />
                        </div>
                        <div className="mx-1 col-3">
                            <label className="text-capitalize">To</label>
                            <input type="date" className="custom-input br-0" />
                        </div>
                        <div className="col-4">
                            <label className="text-capitalize">filter</label>
                            <div className="d-flex">
                                <Button onClick={handleFilter} variant="primary">
                                    filter data
                                </Button>
                                <Button onClick={clearFilters} variant="outline-secondary" className="mx-2" >
                                    clear fields 
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* end of advanced filter */}
            <section className="mx-2">
                <h4> Result Entry Records</h4>
                <UsePaginationTableDisplay 
                    column={columns}
                    endpoint={endpoint}
                    update={isupdate}
                    updatedata={pendingdata}
                    getdata={getdata}
                />
            </section>
        </LaboratoryLayout>
    )
}
