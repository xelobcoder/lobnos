import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import TableDisplay from "../../../components/accessories/TableDisplay";
import { Dropdown } from "react-bootstrap";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockSvg from "../../../components/icons/LockSvg";
import Link from "next/link";
import { fetchOurSourcingOrganization } from "../../../lib/billingLib";


export default function IndexPageOutsource() {
    const [isLoading, setLoading] = useState(true);
    const [organization, setOrganization] = useState([])

    useEffect(() => {
        async function loadInitData() {
            try {
                setLoading(true);
                fetchOurSourcingOrganization(setOrganization);
            }
            catch (err) {
                setLoading(false);
                alert('error getting data');
            } finally {
                setLoading(false);
            }
        }
        loadInitData()
    }, [])


    const columns = [
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Type',
            accessor: 'organizationType',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Address',
            accessor: 'address',
        },
        // {
        //     Header: 'Bill. Add',
        //     accessor: 'billingAddress',
        // },
        {
            Header: 'Contact No.',
            accessor: 'contactNumber',
        },
        {
            Header: 'Contact Person',
            accessor: 'contactPerson',
        },
        {
            Header: 'Added on',
            accessor: 'addedon',
            Cell: ({ value }) => {
                return <div>{new Date(value).toLocaleString()}</div>
            }
        },
        {
            Header: 'Added By',
            accessor: 'createdby',
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                return (
                    <div>
                        <Dropdown  >
                            <Dropdown.Toggle variant="light" id="archives-dropdown">
                                <MoreVertIcon />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="m-0 p-0 bg-white">
                                <Dropdown.Item className='text-capitalize'  >
                                    <Link href={`/settings/outsource/update?orgid=${row.original?.outsourceid}`}>
                                        <LockSvg /> Edit Information
                                    </Link>
                                </Dropdown.Item>
                                <Dropdown.Item className='text-capitalize'  >
                                    <LockSvg /> Delete Information
                                </Dropdown.Item>
                                <Dropdown.Item className='text-capitalize' >
                                    <LockSvg /> Archive organization
                                </Dropdown.Item>

                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                )
            }
        },
    ];



    const Loading = <div className="container">Loading data.....................</div>

    return (
        <MainSettingsLayoutView>
            {isLoading ? Loading : (<section>
                <div className=" col-lg-3">
                    <input type="text" className="custom-input h-40" placeholder="Filter here" />
                </div>
                {organization.length > 0 && <TableDisplay column={columns} data={organization} filtering={false} showpage={false} exporters={false} />}
            </section>)}

        </MainSettingsLayoutView>
    )
}