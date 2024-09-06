import { useEffect, useState } from "react";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import { customFetch } from "../../../components/Auth/customFetch";
import TableDisplay from "../../../components/accessories/TableDisplay";
import { Dropdown } from "react-bootstrap";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LockSvg from "../../../components/icons/LockSvg";
import Link from "next/link";


export default function IndexPageOutsource() {
    const [isLoading, setLoading] = useState(false);
    const [organization, setOrganization] = useState([])

    useEffect(() => {
        async function fetchOurSourcingOrganization() {
            const response = await customFetch(`outsourcing/organization/all`);
            if (Array.isArray(response)) {
                setOrganization(response);
            }
        }
        fetchOurSourcingOrganization()
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
    return (
        <MainSettingsLayoutView>
            <div>
                <input type="text" className="custom-input h-40" placeholder="Filter here" />
            </div>
            <TableDisplay column={columns} data={organization} filtering={false} showpage={false} exporters={false} />
        </MainSettingsLayoutView>
    )
}