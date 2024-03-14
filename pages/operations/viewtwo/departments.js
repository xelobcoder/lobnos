import { useCallback, useContext, useEffect, useState } from "react";
import { ProgressBar } from 'react-bootstrap'
import AuthContext from "../../../components/Auth/useAuthentification";
import UsePaginationTableDisplay from "../../../components/accessories/usePaginationTableDisplay";
import { customFetch, formatTest, getDepartment, handleChangeWithState } from "../../../components/Auth/customFetch";
import { useSearchParams } from "next/navigation";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import Dropdown from '@mui/joy/Dropdown';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import MoreVert from '@mui/icons-material/MoreVert';

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
                const { clinicianName, organization } = row.original;
                return (
                    <div>
                        <span> {value == 0 ? "Self" : clinicianName}</span>
                    </div>
                )
            }
        },
        {
            Header: 'organization', accessor: 'organization', Cell: function ({ value, row }) {
                const { clinicianName, organization } = row.original;
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
                        <MenuButton
                            className='border-0 text-primary'
                            slots={{ root: IconButton }}
                            slotProps={{ root: { variant: 'outlined', color: 'neutral' } }}
                        >
                            <MoreVert />
                        </MenuButton>
                        <Menu>
                            <MenuItem className="text-primary" onClick={(ev) => { gotoResultEntry(row.original) }}> Result Entry</MenuItem>
                            <MenuItem className="text-primary" onClick={(ev) => { gotoResultEntryAll(billingid, patientid) }}>Bulk result entry</MenuItem>
                            {row.original.ready == "true" && <MenuItem className="text-primary">preview</MenuItem>}
                        </Menu>
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
            <section className="d-flex mx-2">
                <div>
                    {/* <label className="text-capitalize">department</label> */}
                    <select value={filter.departmentid} onClick={(ev) => { department.length === 0 && getDepartment(setDepartment); }} className="custom-select br-0" onChange={(ev) => handleChangeWithState(ev, 'departmentid', setFilter, filter)}>
                        <option>select a department</option>
                        <option value='all'>all</option>
                        {department.map((item, index) => <option value={item.id} key={index}>{item.department}</option>)}
                    </select>
                </div>
                <div className="mx-2">
                    {/* <label className="text-capitalize">Cases</label> */}
                    <select value={filter.status} className="custom-select br-0" onChange={(ev) => { handleChangeWithState(ev, 'status', setFilter, filter) }}>
                        <option value='all'>all cases selected</option>
                        <option value='pending'>pending cases</option>
                        <option value='completed'>completed cases</option>
                    </select>
                </div>
                <div className="mx-2">
                    {/* <label className="text-capitalize">test</label> */}
                    <select value={filter.test} onChange={(ev) => { handleChangeWithState(ev, 'test', setFilter, filter) }}
                        onClick={(ev) => { getAllTest() }} className="custom-select br-0">
                        <option value='all'>Select a test to filter</option>
                        {alltest.length > 0 && alltest.map((item, index) => { return <option key={index} value={item.id}>{item.name}</option> })
                        }
                    </select>
                </div>
                <div className="mx-2">
                    {/* <label className="text-capitalize">from</label> */}
                    <input type="date" className="custom-input br-0" />
                </div>
                <div className="mx-2">
                    {/* <label className="text-capitalize">To</label> */}
                    <input type="date" className="custom-input br-0" />
                </div>
                <div className="mx-2">
                    {/* <label className="text-capitalize">filter</label> */}
                    {/* <br /> */}
                    <div className="d-flex justify-content-between">
                        <button onClick={handleFilter} className="btn btn-primary">
                          filter 
                        </button>
                        <button onClick={clearFilters} className="btn btn-sm btn-outline-secondary mx-2" >
                            clear fields 
                        </button>
                    </div>
                </div>
            </section>
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